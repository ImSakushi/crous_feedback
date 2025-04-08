import '../styles/globals.css';
import { marianne } from './fonts';
import AdminPanelButton from '@/components/AdminPanelButton';

export const metadata = {
  title: 'Feedback RU',
  description: 'Donnez votre avis sur les repas du Resto U',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={marianne.variable}>
      <body>
        {children}
        {/* Bouton sticky visible si l’utilisateur est admin */}
        <AdminPanelButton />
      </body>
    </html>
  );
}