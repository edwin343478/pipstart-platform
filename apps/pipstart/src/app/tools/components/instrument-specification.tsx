import type { Instrument } from "../position-size-calculator/instruments";

import styles from "./instrument-specification.module.css";

export default function InstrumentSpecification({
  instrument,
}: {
  instrument: Instrument;
}) {
  return (
    <div className={styles.specification}>
      <dl>
        <div>
          <dt>Quote currency</dt>
          <dd>{instrument.quoteCurrency}</dd>
        </div>
        <div>
          <dt>Pip size</dt>
          <dd>{instrument.pipSize}</dd>
        </div>
        <div>
          <dt>Contract</dt>
          <dd>{instrument.contractSize.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Volume step</dt>
          <dd>{instrument.volumeStep} lots</dd>
        </div>
      </dl>
      <p>{instrument.specificationNote}</p>
    </div>
  );
}
