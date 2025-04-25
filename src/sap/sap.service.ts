import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';
import * as js2xmlparser from 'js2xmlparser';
import * as https from 'https';
@Injectable()
export class SapService {
  constructor(private readonly http: HttpService) {}

  async getOrders() {
    try {
      const request = {
        T_ZSDT_ASIGUBIC: {
          item: [
            {
              UBICA: 'DUMMY',
              OLA: '',
              POSOLA: '',
              PEDSAP: '',
              MENSAJE: '',
            },
          ],
        },
        T_ZSDT_LOGMULVEN: {
          item: [
            {
              CONSEC: '1',
              IDFACTU: '',
              SKUSAP: '',
              PEDSAP: '',
              TANUM: '',
              ENTSAP: '',
              EAN: '',
              CANTID: '',
              OLA: '',
              POSOLA: '',
              FECRGE: '',
              MENSAJE: '',
            },
          ],
        },
      };

      // 👇 Envoltorio SOAP, con atributos en "@"
      const soapEnvelope = {
        '@': {
          'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
          'xmlns:rfc': 'urn:sap-com:document:sap:rfc:functions',
        },
        'soapenv:Header': {},
        'soapenv:Body': {
          'rfc:ZWS_ENVIO_OLA_UBICAC': request,
        },
      };

      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      const xml = js2xmlparser.parse('soapenv:Envelope', soapEnvelope, {
        declaration: {
          encoding: 'UTF-8',
          version: '1.0',
        },
        format: {
          pretty: true,
        },
      });
      const response = await this.http.post('YOUR_ENDPOINT_HERE', xml, {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        },
        httpsAgent: agent,
      });
      console.log('Request', xml);

      // Convertimos XML SOAP a JSON
      const json = await parseStringPromise(response?.['data'], {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true,
      });
      console.log('Response:', json);
      return response?.['data'];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }
}
