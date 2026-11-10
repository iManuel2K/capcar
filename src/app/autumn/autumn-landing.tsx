import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ProductDashboardPreview } from "@/components/marketing/product-dashboard-preview";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ForestFilm } from "./forest-film";
import styles from "./autumn.module.css";

const still = "/autumn/forest.webp";
const heroFilm = "/autumn/road-drive-1080p.mp4";
const roadPoster = "/autumn/road-drive.webp";

export default function AutumnLanding() {
  return (
    <div className={styles.page} lang="en">
      <main id="main-content" className={styles.content}>
        <section className={styles.hero} aria-labelledby="autumn-title">
          <Image
            src={roadPoster}
            alt=""
            fill
            preload
            sizes="100vw"
            className={styles.backdrop}
          />
          <ForestFilm source={heroFilm} />
          <div className={styles.shade} />
          <div className={styles.heroNavigation}>
            <MarketingHeader />
          </div>
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

        <section
          className={`${styles.wrap} ${styles.product}`}
          id="product"
          aria-labelledby="autumn-tools"
        >
          <p className={styles.eyebrow}>03 / The tools</p>
          <h2 id="autumn-tools">
            In the garage. <em>Out on the road.</em>
          </h2>
          <div className={styles.features}>
            <article className={styles.feature} aria-labelledby="autumn-garage">
              <div className={styles.featureCopy}>
                <div>
                  <h3 id="autumn-garage">Garage</h3>
                  <p>Keep service records and completed work in one place.</p>
                </div>
                <Link href="/garage" className={styles.textLink}>
                  Open Garage <ArrowUpRight size={17} aria-hidden />
                </Link>
              </div>
              <div className={styles.dashboard}>
                <ProductDashboardPreview embedded />
              </div>
            </article>
            <article
              className={`${styles.feature} ${styles.tripFeature}`}
              aria-labelledby="autumn-trip-planner"
            >
              <div className={styles.featureCopy}>
                <div>
                  <h3 id="autumn-trip-planner">AI Trip Planner</h3>
                  <p>
                    Give your drive a starting point, a time limit, and a few
                    stops worth making.
                  </p>
                </div>
                <Link href="/ai" className={styles.textLink}>
                  Open Trip Planner <ArrowUpRight size={17} aria-hidden />
                </Link>
              </div>
              <figure className={styles.trip}>
                <Image
                  src="/autumn/trip-planner.webp"
                  alt="CapCar trip planning walkthrough showing the route interface"
                  width={713}
                  height={470}
                  sizes="(min-width: 900px) 690px, 100vw"
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
