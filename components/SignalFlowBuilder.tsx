"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type Module = {
  id: string;
  name: string;
  category?: string;
};

function SortableItem({
                        id,
                        onRemove,
                      }: {
  id: string;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-[#424242] p-3 rounded-md border border-white/10"
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">

        {/* DRAG HANDLE 👇 */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400"
        >
          ☰
        </div>

        {id}
      </div>

      {/* REMOVE BUTTON 👇 */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // 🔥 critical
          onRemove(id);
        }}
        className="text-red-600 text-sm hover:text-red-400 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

export default function SignalFlowBuilder({
                                            value,
                                            onChange,
                                          }: {
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const [modules, setModules] = useState<Module[]>([]);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<string[]>(value || []);

  // 🔥 FETCH MODULES FROM FIRESTORE
  useEffect(() => {
    const fetchModules = async () => {
      const snap = await getDocs(collection(db, "signalFlowModules"));

      const list: Module[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Module, "id">),
      }));

      setModules(list);
    };

    fetchModules();
  }, []);

  // 🔄 SYNC WITH PARENT
  useEffect(() => {
    setItems(value || []);
  }, [value]);

  // 🔍 FILTER
  const filteredModules = modules.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  // ➕ ADD
  const addBlock = (name: string) => {
    if (items.includes(name)) return;

    const updated = [...items, name];
    setItems(updated);
    onChange(updated);
  };

  // ❌ REMOVE
  const removeBlock = (name: string) => {
    const updated = items.filter((i) => i !== name);
    setItems(updated);
    onChange(updated);
  };

  // 🎚 DRAG
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);

    const updated = arrayMove(items, oldIndex, newIndex);

    setItems(updated);
    onChange(updated);
  };

  return (
    <div className="flex gap-4">

      {/* 🔍 SEARCH */}
      <div className="w-full">
        <p className="text-xs mb-2 uppercase tracking-widest text-gray-400">
          Signal Flow Builder
        </p>

        <input
          placeholder="Search signal modules..."
          className="bg-[#424242] p-3 rounded-md text-white w-full mb-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* RESULTS */}
        <div className="max-h-40 overflow-y-auto flex flex-col gap-2">
          {filteredModules.map((mod) => {
            const isSelected = items.includes(mod.name);

            return (
              <button
                key={mod.id}
                onClick={() => {
                  if (!isSelected) addBlock(mod.name);
                }}
                disabled={isSelected}
                className={`p-2 rounded-md text-left transition ${
                  isSelected
                    ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                    : "bg-[#333] hover:bg-[#444]"
                }`}
              >
                <div className="font-bold text-sm flex items-center justify-between">
                  {mod.name}

                  {isSelected && (
                    <span className="text-xs text-[#42B27B]">
              ✓ Added
            </span>
                  )}
                </div>

                {mod.category && (
                  <div className="text-xs text-gray-400">
                    {mod.category}
                  </div>
                )}
              </button>
            );
          })}

          {filteredModules.length === 0 && (
            <p className="text-gray-500 text-sm">
              No modules found
            </p>
          )}
        </div>
      </div>

      {/* 🎚 CHAIN */}
      <div className="flex flex-col gap-2 w-full">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Your Chain
        </p>

        {items.length === 0 && (
          <p className="text-gray-500 text-sm">
            No modules added yet
          </p>
        )}

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {items.map((id) => (
                <SortableItem
                  key={id}
                  id={id}
                  onRemove={removeBlock}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}