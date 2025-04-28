export type SAPOrdersResponse = {
  'soap-env:Envelope': {
    'soap-env:Header': string;
    'soap-env:Body': {
      'n0:ZWS_ENVIO_OLA_UBICACResponse': {
        T_ZSDT_ASIGUBIC: {
          item: AsigUbicItem[];
        };
        T_ZSDT_LOGMULVEN: {
          item: LogMulvenItem[];
        };
      };
    };
  };
};

type AsigUbicItem = {
  UBICA: string;
  OLA: string;
  POSOLA: string;
  PEDSAP: string;
  MENSAJE: string;
};

type LogMulvenItem = {
  CONSEC: string;
  IDFACTU: string;
  SKUSAP: string;
  PEDSAP: string;
  TANUM: string;
  ENTSAP: string;
  EAN: string;
  CANTID: string;
  OLA: string;
  POSOLA: string;
  FECREG: string; // ISO date string
  MENSAJE: string;
};
