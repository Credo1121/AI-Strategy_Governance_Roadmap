import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'AI Strategy Studio · Beratungswerkzeuge',description:'AI-Strategie, Wertschöpfung und Sechs-Wochen-Roadmap für Beraterteams. Synthetische Demonstrationsdaten.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="de"><body>{children}</body></html>}
