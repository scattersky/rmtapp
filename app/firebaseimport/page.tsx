'use client';
import React, { useState } from "react";
import csv from "csvtojson";
import { getFirestore, doc, writeBatch } from "firebase/firestore";

export default function FirestoreCSVImporter() {
  const [loading, setLoading] = useState(false);
  const db = getFirestore();

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();

      const jsonArray = await csv().fromString(text);

      let batch = writeBatch(db);
      let count = 0;

      jsonArray.forEach((row, index) => {
        const docId = row.doc_id;

        const ref = doc(db, "signalFlowModules", docId);

        batch.set(ref, {
          affiliateLink: row.affiliateLink,
          category: row.category,
          name: row.name,
        });

        count++;

        // Firestore limit = 500 per batch
        if (count === 500) {
          batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      });

      if (count > 0) {
        await batch.commit();
      }

      alert("Import complete 🚀");
    } catch (err) {
      console.error(err);
      alert("Import failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Import CSV to Firestore</h3>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {loading && <p>Uploading...</p>}
    </div>
  );
}