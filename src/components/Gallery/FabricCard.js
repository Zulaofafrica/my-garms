import styles from "./FabricCard.module.css";
import { ShoppingBag } from "lucide-react";

export default function FabricCard({ fabric, onSelect }) {
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                {/* Placeholder for real image */}
                <div className={styles.placeholder} style={{ backgroundColor: fabric.color === 'Multi' ? '#e5e5e5' : fabric.color.toLowerCase() }}>
                    {fabric.color}
                </div>
            </div>
            <div className={styles.details}>
                <div className={styles.info}>
                    <h3 className={styles.name}>{fabric.name}</h3>
                    <p className={styles.type}>{fabric.type}</p>
                </div>
                <div className={styles.footer}>
                    <span className={styles.price}>₦{fabric.price.toLocaleString()}/yd</span>
                    {onSelect ? (
                        <button onClick={() => onSelect(fabric)} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                            Select
                        </button>
                    ) : (
                        <button className={styles.addButton}>
                            <ShoppingBag size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
