import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';

import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
