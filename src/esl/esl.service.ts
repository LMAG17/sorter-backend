import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateLocationDto } from './dto/create-location.dto';
import * as https from 'https';

@Injectable()
export class EslService {
  baseUrl: string | undefined = '';
  apiKey: string | undefined = '';
  headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  agent: https.Agent;

  constructor(
    private readonly http: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('ESL_SERVER_URL');
    this.apiKey = this.configService.get<string>('API_KEY');
    this.headers['x-api-key'] = this.apiKey;
    this.agent = new https.Agent({ rejectUnauthorized: false });
  }

  async performRequest({
    method = 'GET',
    endpoint,
    data,
  }: {
    method?: string;
    endpoint: string;
    data?: any;
  }) {
    const url = `${this.baseUrl}/${endpoint}`;

    console.info('🔗 Performing request:', `[${method}] ${url}`);
    const response = await this.http
      .request({
        method,
        url,
        data,
        headers: this.headers,
        httpsAgent: this.agent,
      })
      .toPromise();
    console.log('Perform request Response:', response?.data);

    return response;
  }

  // ------------ Labels ------------

  async getAllLabels() {
    try {
      const response = await this.performRequest({
        endpoint: 'ESL',
      });
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESLs:', error);
      throw error;
    }
  }

  async getAvailableLabels() {
    try {
      const response = await this.getAllLabels();
      return response?.filter(({ ID }: { ID: string }) => !!!ID);
    } catch (error) {
      console.error('Error fetching ESLs:', error);
      throw error;
    }
  }

  async getLabelById(id: string) {
    try {
      const response = await this.performRequest({
        endpoint: `ESL/${id}`,
      });
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESL:', error);
      throw error;
    }
  }

  async getSpecificLabelProperty(id: string, property: string) {
    try {
      const response = await this.performRequest({
        endpoint: `ESL/${id}/${property}`,
      });
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESL:', error);
      throw error;
    }
  }

  async updateLabel(id: string, data: any) {
    try {
      const response = await this.performRequest({
        method: 'PUT',
        endpoint: `ESL/${id}`,
        data,
      });
      return response?.data;
    } catch (error) {
      console.error('Error updating ESL:', error);
      throw error;
    }
  }

  SOUNDS = {
    PROSSECING: (mac: string) =>
      `ESL/${mac}/MIDI_SOUND/0/HIGH/procesando:d=8,o=5,b=100:g6,e6,c6,p,g6,e6,c6`,
    COMPLETED: (mac: string) =>
      `ESL/${mac}/MIDI_SOUND/0/HIGH/completado:d=8,o=5,b=160:c6,e6,g6,p,g6`,
  };

  async emitLabelSound(mac: string, sound: 'PROSSECING' | 'COMPLETED') {
    const response = await this.performRequest({
      method: 'POST',
      endpoint: this.SOUNDS[sound](mac),
    });

    return response;
  }

  async flashLabelLed(
    id: string,
    color: 'RED' | 'GREEN' | 'BLUE' | 'ORANGE' | 'PURPLE' | 'CYAN',
    period: number,
    percentage: number,
    repeatTimes: number,
  ) {
    const response = await this.performRequest({
      method: 'POST',
      endpoint: `ESL/${id}/LED/${color}/${period}/${percentage}/${repeatTimes}`,
    });
    return response;
  }

  async linkLabelToLocation(id: string, locationId: string) {
    try {
      await this.performRequest({
        method: 'DELETE',
        endpoint: `ESL/${id}/link`,
      });
      const response = await this.performRequest({
        method: 'POST',
        endpoint: `ESL/${id}/link/${locationId}`,
      });
      return response?.data;
    } catch (error) {
      console.error('Error linking ESL to product:', error);
      throw error;
    }
  }

  async unlinkLabelAndLocation(id: string) {
    try {
      const response = await this.performRequest({
        method: 'PUT',
        endpoint: `ESL/${id}/unlink`,
      });
      return response?.data;
    } catch (error) {
      console.error('Error unlinking ESL from product:', error);
      throw error;
    }
  }

  // ------------ Locations ------------

  async createLocation(data: CreateLocationDto) {
    try {
      const response = await this.performRequest({
        method: 'PUT',
        endpoint: 'Products',
        data: [data],
      });
      return response?.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async getAllLocations() {
    try {
      const response = await this.performRequest({
        method: 'GET',
        endpoint: 'Products',
      });
      return response?.data;
    } catch (error) {
      console.error('Error fetching Locations:', error);
      throw error;
    }
  }

  async getAllLocationsBySorter(sorterID: string) {
    try {
      const response = await this.getAllLocations();
      return response?.filter(
        ({ sorter }: { sorter: string }) => sorter === sorterID,
      );
    } catch (error) {
      console.error('Error fetching Locations:', error);
      throw error;
    }
  }

  async getAvailableLocations() {
    try {
      const response = await this.getAllLocations();
      return response?.filter(({ orderID }: { orderID: string }) => !!!orderID);
    } catch (error) {
      console.error('Error fetching Locations:', error);
      throw error;
    }
  }

  async getLocationById(id: string) {
    try {
      const response = await this.performRequest({
        endpoint: `Products/${id}`,
      });
      return response?.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async updateLocation(
    id: string,
    column:
      | 'id'
      | 'name'
      | 'productEAN'
      | 'orderID'
      | 'productQuantity'
      | 'pickedQuantity'
      | 'totalQuantity',
    value: number | string,
  ) {
    try {
      const endpoint = `Products/${encodeURIComponent(id)}/${encodeURIComponent(column)}/${encodeURIComponent(value)}`;
      const response = await this.performRequest({
        method: 'POST',
        endpoint: endpoint,
      });
      return response?.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async smartUpdateLocation(
    id: string,
    data: {
      productEAN?: string;
      orderID?: string;
      productQuantity?: number;
      pickedQuantity?: number;
      totalQuantity?: number;
    },
  ) {
    console.log('Smart update location', id, data);

    if (!id) {
      throw new Error('ID is required');
    }
    if (!!data.orderID) {
      await this.updateLocation(id, 'orderID', data.orderID);
    }
    if (!!data.productEAN) {
      await this.updateLocation(id, 'productEAN', data.productEAN);
    }
    if (!!data.productQuantity) {
      await this.updateLocation(id, 'productQuantity', data.productQuantity);
    }
    if (!!data.pickedQuantity) {
      await this.updateLocation(id, 'pickedQuantity', data.pickedQuantity);
    }
    if (!!data.totalQuantity) {
      await this.updateLocation(id, 'totalQuantity', data.totalQuantity);
    }
    return data;
  }

  async deleteLocation(id: string) {
    try {
      const response = await this.performRequest({
        method: 'DELETE',
        endpoint: `Products/${id}`,
      });
      return response?.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // ------------ Links ------------

  async getAllLinks() {
    try {
      const response = await this.performRequest({
        endpoint: 'Links',
      });

      return response?.data;
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  }

  async getLinkById(id: string) {
    try {
      const response = await this.performRequest({
        endpoint: `Links/${id}`,
      });

      return response?.data;
    } catch (error) {
      console.error('Error fetching link:', error);
      throw error;
    }
  }
}
