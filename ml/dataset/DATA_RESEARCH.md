# Data Research Note

## Kaggle/public data review

A direct Kaggle dataset was not imported into this MVP. Public datasets commonly available for emotion, speech, or social-signal research do not provide the exact child-learning indicators and therapist-labelled support-area target required by this application. Many also contain sensitive voice, face, or clinical-style labels that would need separate consent, licensing, de-identification, and ethics review.

For this reason, the current training file is a transparent synthetic dataset rather than an unverified Kaggle import. This avoids claiming that public research labels represent a child's support needs.

## Current dataset construction

`generate_synthetic_dataset.py` creates 500 rows with a fixed random seed. Each row has realistic ranges for the 11 learning indicators. The label is an educational mapping to the lowest of four domain scores, with 8% controlled label noise to make the demo less artificially perfect. This is a benchmark/demo signal, not a clinical ground truth.

## Future public-data path

Before importing any Kaggle/public source:

1. Record the dataset URL, version, license, and citation.
2. Confirm commercial/hackathon use is allowed.
3. Remove direct identifiers and do not use face/video as a diagnostic signal.
4. Map only measurable learning indicators with a documented transformation.
5. Obtain qualified therapist review for target labels.
6. Keep a held-out validation set from a different source.

The model output remains an educational recommended support area and must not be presented as a diagnosis or treatment recommendation.
