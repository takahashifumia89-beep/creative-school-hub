import { useState } from "react";
import { ArrowUpRight, Shuffle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { L, useLocale } from "./locale";
import { SparkArtwork } from "./SparkArtwork";
import { briefConfig, sparkHref, sparkPalettes, sparkStyles } from "./spark";
import "./spark.css";

export function SparkLanding() {
  const { t, lang } = useLocale(),
    [palette, setPalette] = useState(0),
    [variation, setVariation] = useState(0);
  const config = {
    ...briefConfig("sound", lang),
    palette: sparkPalettes[palette].id,
    style: sparkStyles[variation % 3].id,
    seed: variation,
  };
  return (
    <div className="spark-landing-stage">
      <div className="spark-stage-note">
        <span className="spark-live-dot" />
        {t(L("Ваша первая искра", "Your first spark", "Алғашқы ұшқыныңыз"))}
        <span>01 / ∞</span>
      </div>
      <Link
        href={sparkHref(config)}
        className="spark-landing-art"
        aria-label={t(
          L(
            "Доработать этот постер",
            "Make this poster yours",
            "Осы постерді өңдеу",
          ),
        )}
      >
        <SparkArtwork
          config={config}
          label={t(
            L(
              "Интерактивный постер",
              "Interactive poster",
              "Интерактивті постер",
            ),
          )}
        />
        <span className="spark-art-sticker">
          <ArrowUpRight size={20} />
          {t(
            L(
              "Это можно\nизменить.",
              "Make it\nyours.",
              "Өзіңізше\nөзгертіңіз.",
            ),
          )}
        </span>
      </Link>
      <div className="spark-live-controls">
        <div
          role="group"
          aria-label={t(L("Цвет постера", "Poster color", "Постер түсі"))}
        >
          {sparkPalettes.slice(0, 4).map((p, i) => (
            <button
              key={p.id}
              className="spark-swatch"
              style={{ background: p.bg, color: p.ink }}
              aria-label={t(p.name)}
              aria-pressed={i === palette}
              onClick={() => setPalette(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <button onClick={() => setVariation((v) => (v + 1) % 9999)}>
          <Shuffle size={15} />
          {t(L("Другая форма", "Remix the form", "Басқа пішін"))}
        </button>
      </div>
      <p className="spark-stage-caption">
        {t(
          L(
            "Меняйте цвет. Пробуйте форму. Это уже ваша работа.",
            "Change the color. Explore the form. You're already creating.",
            "Түсті өзгертіңіз. Пішінді байқап көріңіз. Сіз қазірдің өзінде жасап жатырсыз.",
          ),
        )}
      </p>
    </div>
  );
}

export function SparkSpotlight() {
  const { t, lang } = useLocale();
  return (
    <section className="spark-spotlight">
      <div className="spark-spotlight-copy">
        <span className="cs-eyebrow">
          <Sparkles size={13} />{" "}
          {t(
            L(
              "Искра / мастерская идей",
              "Spark / idea workshop",
              "Ұшқын / идея шеберханасы",
            ),
          )}
        </span>
        <h2>
          {t(
            L(
              "А что, если\nпопробовать иначе?",
              "What if you\ntried it your way?",
              "Өзгеше\nжасап көрсек ше?",
            ),
          )}
        </h2>
        <p>
          {t(
            L(
              "Тема, цвет, форма — и первая версия уже перед вами. Превратите её в работу со своим характером.",
              "A theme, a color, a form. Your first version is already there. Give it your own character.",
              "Тақырып, түс, пішін — алғашқы нұсқа алдыңызда. Оған өз мінезіңізді беріңіз.",
            ),
          )}
        </p>
        <Link className="spark-button" href="/spark">
          {t(L("Зажечь идею", "Make a spark", "Идеяны тұтату"))}
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <Link
        href="/spark"
        className="spark-spotlight-art"
        aria-label={t(
          L(
            "Открыть мастерскую Искра",
            "Open the Spark workshop",
            "Ұшқын шеберханасын ашу",
          ),
        )}
      >
        <SparkArtwork
          config={{
            ...briefConfig("exhibition", lang),
            format: "poster",
            palette: "peach",
          }}
          label={t(
            L(
              "Пример геометрического постера",
              "Geometric poster example",
              "Геометриялық постер үлгісі",
            ),
          )}
        />
        <SparkArtwork
          config={{ ...briefConfig("sound", lang), style: "orbit" }}
          label={t(
            L(
              "Пример типографического постера",
              "Typographic poster example",
              "Типографиялық постер үлгісі",
            ),
          )}
        />
      </Link>
    </section>
  );
}
