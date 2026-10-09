import {
  calculatorLearning,
  type CalculatorLearningRoute,
} from "../calculator-learning";
import RelatedLesson from "./related-lesson";
import styles from "./calculator-learning.module.css";

export default function CalculatorLearning({
  route,
  className,
}: {
  route: CalculatorLearningRoute;
  className: string;
}) {
  const content = calculatorLearning[route];
  const headingId = `${route}-learning-title`;

  return (
    <>
      <section
        className={`${className} ${styles.learning}`}
        aria-labelledby={headingId}
      >
        <h2 id={headingId}>How this calculation works</h2>
        <p>{content.question}</p>
        <h3>Formula in plain language</h3>
        <ul>
          {content.formulas.map((formula) => (
            <li key={formula}>{formula}</li>
          ))}
        </ul>
        <h3>What the terms mean</h3>
        <dl>
          {content.terms.map(({ term, meaning }) => (
            <div key={term}>
              <dt>
                <strong>{term}</strong>
              </dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section
        className={`${className} ${styles.learning}`}
        aria-labelledby={`${route}-example-title`}
      >
        <h2 id={`${route}-example-title`}>Worked example</h2>
        <p>
          This is a fixed teaching example, separate from your current inputs.
        </p>
        <p>{content.example.setup}</p>
        <ol>
          {content.example.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>
          <strong>{content.example.result}</strong>
        </p>
        <h3>What the result means</h3>
        <p>{content.interpretation}</p>
        <h3>What this does not tell you</h3>
        <p>{content.limitations}</p>
      </section>
      <RelatedLesson
        description={content.lesson.description}
        href={content.lesson.href}
        title={content.lesson.title}
      />
    </>
  );
}
