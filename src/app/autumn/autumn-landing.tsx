import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ProductDashboardPreview } from "@/components/marketing/product-dashboard-preview";
import { AutumnAccountLink } from "./autumn-account-link";
import { ForestFilm } from "./forest-film";
import styles from "./autumn.module.css";

const still = "/autumn/forest.webp";
const film = "/autumn/forest.mp4";

export default function AutumnLanding() {
  const video = existsSync(join(process.cwd(), "public", film))
    ? film
    : undefined;

  return (
    <div className={styles.page} lang="en">
      <main id="main-content" className={styles.content}>
        <section className={styles.hero} aria-labelledby="autumn-title">
          <Image
            src={still}
            alt=""
            fill
            preload
            sizes="100vw"
            className={styles.backdrop}
          />
          {video && <ForestFilm source={video} />}
          <div className={styles.shade} />
          <nav className={`${styles.glass} ${styles.nav}`} aria-label="CapCar">
            <Link href="/" className={styles.brand}>
              <Image src="/capcar-mark-192.png" alt="" width={26} height={26} />
              CapCar
            </Link>
            <div className={styles.links}>
              <Link href="/garage">Garage</Link>
              <Link href="/roadbook">Roadbook</Link>
              <Link href="/en/journal">Journal</Link>
            </div>
            <AutumnAccountLink />
          </nav>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Built for the long way home</p>
            <h1 id="autumn-title">
              From plan to <em>road.</em>
            </h1>
            <p>Plan the build. Keep the history. Find a road worth driving.</p>
            <div className={styles.actions}>
              <a href="#product" className={styles.primary}>
                Explore CapCar <ArrowDown size={17} aria-hidden />
              </a>
              <Link
                href="/roadbook"
                className={`${styles.glass} ${styles.button}`}
              >
                Find a scenic drive <ArrowUpRight size={17} aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.about}`}>
          <p className={styles.eyebrow}>The CapCar story</p>
          <h2>
            The drive is only <em>half the story.</em>
          </h2>
          <p>
            There’s the part you spent a Saturday fitting, the service you want
            to remember, and the bend that made the detour worth it. CapCar
            gives each one a place.
          </p>
        </section>

        <section
          className={`${styles.wrap} ${styles.scene}`}
          aria-labelledby="roadbook-title"
        >
          <div className={styles.sceneMedia}>
            <Image
              src={still}
              alt="A black BMW on an autumn forest road"
              fill
              sizes="(max-width: 768px) 100vw, 1100px"
            />
            {video && (
              <video
                src={video}
                controls
                muted
                playsInline
                preload="none"
                poster={still}
                aria-label="BMW autumn forest drive"
              />
            )}
          </div>
          <div className={`${styles.glass} ${styles.sceneCopy}`}>
            <p className={styles.eyebrow}>02 / Roadbook</p>
            <h2 id="roadbook-title">
              Take the <em>long way home.</em>
            </h2>
            <p>
              Find a scenic road, pick a place to stop, and leave room for a
              detour.
            </p>
            <Link href="/roadbook" className={styles.textLink}>
              Explore Roadbook <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.product}`} id="product">
          <p className={styles.eyebrow}>03 / The tools</p>
          <h2>
            In the garage. <em>Out on the road.</em>
          </h2>
          <div className={styles.cards}>
            <article className={`${styles.glass} ${styles.card}`}>
              <h3>Garage</h3>
              <p>Keep service records and the work you’ve done in one place.</p>
              <Link href="/garage" className={styles.textLink}>
                Open Garage <ArrowUpRight size={17} aria-hidden />
              </Link>
              <div className={styles.dashboard}>
                <ProductDashboardPreview />
              </div>
            </article>
            <article className={`${styles.glass} ${styles.card}`}>
              <h3>AI Trip Planner</h3>
              <p>
                Give your drive a starting point, a time limit, and a few stops
                worth making.
              </p>
              <Link href="/ai" className={styles.textLink}>
                Open Trip Planner <ArrowUpRight size={17} aria-hidden />
              </Link>
              <figure className={styles.trip}>
                <Image
                  src="/autumn/trip-planner.webp"
                  alt="CapCar trip planning walkthrough showing the route interface"
                  width={713}
                  height={470}
                />
                <figcaption>CapCar Trip Planner walkthrough</figcaption>
              </figure>
            </article>
          </div>
        </section>

        <section
          id="projects"
          className={`${styles.wrap} ${styles.projects}`}
          aria-labelledby="autumn-projects"
        >
          <div>
            <p className={styles.eyebrow}>04 / The project</p>
            <h2 id="autumn-projects">
              Start with <em>one job.</em>
            </h2>
            <p>
              Give your next job a budget, a parts list, and a place to record
              what actually changed.
            </p>
            <Link href="/project-car-planner" className={styles.textLink}>
              Explore the Project Car Planner{" "}
              <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
          <Link
            href="/en/journal/bmw-318i-e90-kosten"
            className={`${styles.glass} ${styles.projectLink}`}
          >
            <span className={styles.eyebrow}>From the Journal</span>
            <span>BMW 318i E90 ownership diary</span>
            <ArrowUpRight size={17} aria-hidden />
          </Link>
        </section>
        <MarketingFaq light={false} />

        <section className={styles.closing}>
          <Image src={still} alt="" fill sizes="100vw" />
          <div className={styles.shade} />
          <div className={styles.closingCopy}>
            <p className={styles.eyebrow}>05 / The next mile</p>
            <h2>
              What’s next for <em>your car?</em>
            </h2>
            <Link href="/project-car-planner" className={styles.primary}>
              Plan your build <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
