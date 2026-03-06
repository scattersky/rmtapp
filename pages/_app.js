import 'primereact/resources/themes/saga-green/theme.css';
import 'primereact/resources/primereact.min.css';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {




  return (
    <>
      <AuthProvider>

        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}

export default MyApp;
