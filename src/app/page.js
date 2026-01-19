import Link from "next/link";
import styles from "./page.module.css";
import { MoveRight, Ruler, Component, Shirt } from "lucide-react";

export default function Home() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={styles.title}>
                        Tailored Perfection, <br />
                        <span className={styles.highlight}>Designed by You.</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Experience the future of fashion. Custom-made outfits, premium fabrics,
                        and precise measurements—all from the comfort of your home.
                    </p>
                    <div className={styles.ctaGroup}>
                        <Link href="/design" className="btn btn-primary">
                            Start Designing <MoveRight className="ml-2 w-4 h-4" size={16} style={{ marginLeft: 8 }} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.features}>
                <div className="container">
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <Ruler size={32} className={styles.icon} />
                            <h3>Perfect Fit</h3>
                            <p>Input your measurements once and get outfits tailored exactly to your body.</p>
                        </div>
                        <div className={styles.card}>
                            <Component size={32} className={styles.icon} />
                            <h3>3D Visualization</h3>
                            <p>Preview your design on a 3D avatar before you order.</p>
                        </div>
                        <div className={styles.card}>
                            <Shirt size={32} className={styles.icon} />
                            <h3>Premium Fabrics</h3>
                            <p>Choose from our curated collection of high-quality local and international fabrics.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
