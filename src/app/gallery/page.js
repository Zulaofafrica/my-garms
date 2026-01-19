import styles from "./gallery.module.css";
import FabricCard from "@/components/Gallery/FabricCard";
import { FABRICS } from "@/lib/data";

export default function GalleryPage() {
    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>Fabric Collection</h1>
                <p className={styles.subtitle}>Curated premium fabrics for your custom designs.</p>
            </header>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <div className={styles.filterSection}>
                        <h3>Categories</h3>
                        <ul>
                            <li><label><input type="checkbox" /> Cotton</label></li>
                            <li><label><input type="checkbox" /> Wool</label></li>
                            <li><label><input type="checkbox" /> Silk</label></li>
                            <li><label><input type="checkbox" /> Linen</label></li>
                        </ul>
                    </div>
                    <div className={styles.filterSection}>
                        <h3>Price Range</h3>
                        <input type="range" min="0" max="200" className={styles.range} />
                    </div>
                </aside>

                <main className={styles.grid}>
                    {FABRICS.map((fabric) => (
                        <FabricCard key={fabric.id} fabric={fabric} />
                    ))}
                </main>
            </div>
        </div>
    );
}
