import type { IdviaEnvironment } from '@idvia/react-native-sdk';

export const CONFIG = {
  environment: 'pre' as IdviaEnvironment,
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  useCaseIds: {
    videoIdUnassisted: 'YOUR_UNASSISTED_USE_CASE_ID',
    videoIdAssisted: 'YOUR_ASSISTED_USE_CASE_ID',
    sign: 'YOUR_SIGN_USE_CASE_ID',
  },
  /** Document type for the unassisted flow — mandatory: 'Id', 'Passport', 'DriversLicense', … */
  docType: 'Id',
  /** Mandatory for the assisted flow: ISO country + language codes. */
  serviceCountry: 'ES',
  language: 'es',
  /** Subject identity for the assisted flow — the API rejects the call without name/surname. */
  subject: { name: 'Ada', surname: 'Lovelace' },
  /** Unassisted flow tuning — sent as the API's nested `configuration` object (landing URLs are added by the SDK). */
  unassistedConfiguration: {
    saveVideoRecording: true,
    language: 'es',
    otpBefore: false,
    otpDuring: false,
    preCallTest: false,
    checkMrz: true,
    manualSnapshot: false,
    useDocumentVerificationEngine: true,
    usePassiveLifeLivenessEngine: true,
    passiveLifeLivenessThreshold: 70,
    checkForFaceMatching: true,
    faceMatchSimilarityThreshold: 70,
    useActiveLifeLivenessEngine: true,
    slaExpirationSeconds: 3600,
    slaExpirationAdviseSeconds: 1800,
    videoAssistedInterconnection: false,
    CheckFaceMatchingDuring: false,
    CheckOcrMatch: false,
    workflow: ['record', 'front', 'back', 'selfie', 'liveness', 'stoprecording'],
  },
  landingUrl: 'https://app.example.com/tc/ok',
  landingKoUrl: 'https://app.example.com/tc/ko',
  signer: { clientReference: 'signer-1', name: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'SIGNER' as const },
  signDocumentUrl: 'https://your-host.example.com/document.pdf',
};
