import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';
import * as js2xmlparser from 'js2xmlparser';
import * as https from 'https';
import { ConfigService } from '@nestjs/config';
import { SAPOrdersResponse } from './tyoes';

@Injectable()
export class SapService {
  baseUrl: string | undefined = '';
  agent: https.Agent | undefined = undefined;
  constructor(
    private readonly http: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('SAP_SERVER_URL');
    this.agent = new https.Agent({
      rejectUnauthorized: false,
    });
  }

  formatOrders(data: SAPOrdersResponse) {
    const locations =
      data['soap-env:Envelope']['soap-env:Body'][
        'n0:ZWS_ENVIO_OLA_UBICACResponse'
      ]['T_ZSDT_ASIGUBIC']['item'];

    const products =
      data['soap-env:Envelope']['soap-env:Body'][
        'n0:ZWS_ENVIO_OLA_UBICACResponse'
      ]['T_ZSDT_LOGMULVEN']['item'] ?? [];

    const locationsIsArray = Array.isArray(locations);

    let locationsFormatted = locationsIsArray
      ? locations.map((location) => {
          return {
            location: location.UBICA,
            wave: location.OLA,
            PEDSAP: location.PEDSAP,
            message: location.MENSAJE,
            status: !!location.UBICA ? 1 : 0,
            products: [] as any[],
          };
        })
      : [
          {
            location: locations?.['UBICA'],
            wave: locations?.['OLA'],
            PEDSAP: locations?.['PEDSAP'],
            message: locations?.['MENSAJE'],
            status: !!locations?.['UBICA'] ? 1 : 0,
            products: [] as any[],
          },
        ];

    for (const product of products) {
      const location = locationsFormatted.find(
        (loc) => loc.PEDSAP === product.PEDSAP,
      );

      if (location) {
        location.products = location.products || [];
        location.products.push({
          EAN: product.EAN,
          quantity: Number(product.CANTID),
        });
      }
    }

    return locationsFormatted;
  }

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

      const xml = js2xmlparser.parse('soapenv:Envelope', soapEnvelope, {
        declaration: {
          encoding: 'UTF-8',
          version: '1.0',
        },
        format: {
          pretty: true,
        },
      });
      console.log('Request', xml);
      const DUMMY = false;
      const response = DUMMY
        ? this.mockGetOrders()
        : await this.http
            .post(
              `${this.baseUrl}/sap/bc/srt/rfc/sap/zws_envio_ola/300/zws_envio_ola/zws_envio_ola`,
              xml,
              {
                headers: {
                  'Content-Type': 'text/xml;charset=UTF-8',
                },
                httpsAgent: this.agent,
              },
            )
            .toPromise();

      // Convertimos XML SOAP a JSON
      const json: SAPOrdersResponse = await parseStringPromise(response?.data, {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true,
      });

      const orders = this.formatOrders(json);

      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  mockGetOrders() {
    return {
      data: `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
    <soap-env:Header/>
    <soap-env:Body>
        <n0:ZWS_ENVIO_OLA_UBICACResponse xmlns:n0="urn:sap-com:document:sap:rfc:functions">
            <T_ZSDT_ASIGUBIC>
                <item>
                    <UBICA>DUMMY</UBICA>
                    <OLA/>
                    <POSOLA/>
                    <PEDSAP/>
                    <MENSAJE>ENVIADO</MENSAJE>
                </item>
                <item>
                  <UBICA>10000000004</UBICA>
                  <OLA>20000839049</OLA>
                  <POSOLA/>
                  <PEDSAP>4810541876</PEDSAP>
                  <MENSAJE>DESTELLE</MENSAJE>
                </item>
            </T_ZSDT_ASIGUBIC>
            <T_ZSDT_LOGMULVEN>
                  <item>
                     <CONSEC>0000001407</CONSEC>
                     <IDFACTU>44</IDFACTU>
                     <SKUSAP>20010439001</SKUSAP>
                     <PEDSAP>4810541858</PEDSAP>
                     <TANUM>0004367846</TANUM>
                     <ENTSAP>82088066</ENTSAP>
                     <EAN>7703907706404</EAN>
                     <CANTID>4</CANTID>
                     <OLA>2000039036</OLA>
                     <POSOLA/>
                     <FECREG>2023-10-03T16:00:00</FECREG>
                     <MENSAJE>ENVIADO</MENSAJE>
                  </item>
                  <item>
                     <CONSEC>0000001408</CONSEC>
                     <IDFACTU>44</IDFACTU>
                     <SKUSAP>20010439001</SKUSAP>
                     <PEDSAP>4810541876</PEDSAP>
                     <TANUM>0004367846</TANUM>
                     <ENTSAP>82088066</ENTSAP>
                     <EAN>7703907706404</EAN>
                     <CANTID>4</CANTID>
                     <OLA>2000039036</OLA>
                     <POSOLA/>
                     <FECREG>2023-10-03T16:00:00</FECREG>
                     <MENSAJE>ENVIADO</MENSAJE>
                  </item>
                  <item>
                    <CONSEC>00000091430</CONSEC>
                    <IDFACTU>55</IDFACTU>
                    <SKUSAP>000000000020003257002</SKUSAP>
                    <PEDSAP>4810541876</PEDSAP>
                    <TANUM>0004367923</TANUM>
                    <ENTSAP>00020000000</ENTSAP>
                    <EAN>7707324664620</EAN>
                    <CANTID>6</CANTID>
                    <OLA>20000839049</OLA>
                    <POSOLA/>
                    <FECREG>0000-00-00</FECREG>
                    <MENSAJE>DESTELLE</MENSAJE>
                  </item>
            </T_ZSDT_LOGMULVEN>
        </n0:ZWS_ENVIO_OLA_UBICACResponse>
    </soap-env:Body>
</soap-env:Envelope>`,
    };
  }

  async updateOrder(
    PEDSAP: string,
    items: { MATNR: string; LFIMG: number }[],
    isLastBox: boolean,
  ) {
    try {
      const request = {
        GT_DATENT: {
          item: items,
        },
        GV_OPERARIO: 'USUARIO DE PRUEBA',
        GV_ULTENT: !!isLastBox ? 'X' : '',
        GV_VBELN: PEDSAP,
      };

      const soapEnvelope = {
        '@': {
          'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
          'xmlns:urn': 'urn:sap-com:document:sap:rfc:functions',
        },
        'soapenv:Header': {},
        'soapenv:Body': {
          'urn:ZSDMF_IMPETI_MV': request,
        },
      };

      const xml = js2xmlparser.parse('soapenv:Envelope', soapEnvelope, {
        declaration: {
          encoding: 'UTF-8',
          version: '1.0',
        },
        format: {
          pretty: true,
        },
      });

      console.log('Request', xml);

      const response = await this.http
        .post(
          `${this.baseUrl}/sap/bc/srt/rfc/sap/zws_sorter_mv/300/zws_sorter_mw/zws_sorter_mv`,
          xml,
          {
            headers: {
              'Content-Type': 'text/xml',
            },
            httpsAgent: this.agent,
          },
        )
        .toPromise();

      // Convertimos XML SOAP a JSON
      const json = await parseStringPromise(response?.data, {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true,
      });
      console.log('Response:', json);
      return json;
    } catch (error) {
      console.error('Error updating order:', error?.response?.data);
      throw error;
    }
  }
}
