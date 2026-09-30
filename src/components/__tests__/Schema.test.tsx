/* tslint:disable:no-implicit-dependencies */

import { shallow } from 'enzyme';
import * as React from 'react';

import { Schema } from '../';
import { OpenAPIParser, SchemaModel } from '../../services';
import { RedocNormalizedOptions } from '../../services/RedocNormalizedOptions';
import { withTheme } from '../testProviders';

const options = new RedocNormalizedOptions({});
describe('Components', () => {
  describe('SchemaView', () => {
    const parser = new OpenAPIParser(
      { openapi: '3.0', info: { title: 'test', version: '0' }, paths: {} },
      undefined,
      options,
    );

    describe('Object description', () => {
      it('should render the description of a top-level object schema', () => {
        const schema = new SchemaModel(
          parser,
          {
            type: 'object',
            description: 'Top-level object description',
            properties: { name: { type: 'string' } },
          },
          '',
          options,
        );
        const html = shallow(withTheme(<Schema schema={schema} />)).html();
        expect(html.includes('Top-level object description')).toBe(true);
      });

      it('should render the description of the selected oneOf variant', () => {
        const schema = new SchemaModel(
          parser,
          {
            oneOf: [
              {
                type: 'object',
                title: 'First',
                description: 'First variant description',
                properties: { a: { type: 'string' } },
              },
              {
                type: 'object',
                title: 'Second',
                description: 'Second variant description',
                properties: { b: { type: 'string' } },
              },
            ],
          },
          '',
          options,
        );
        const html = shallow(withTheme(<Schema schema={schema} />)).html();
        expect(html.includes('First variant description')).toBe(true);
        expect(html.includes('Second variant description')).toBe(false);
      });

      it('should render a nested object description only once, in its field row', () => {
        const schema = new SchemaModel(
          parser,
          {
            type: 'object',
            properties: {
              address: {
                type: 'object',
                description: 'Nested object description',
                properties: { street: { type: 'string' } },
              },
            },
          },
          '',
          options,
        );
        const html = shallow(withTheme(<Schema schema={schema} />)).html();
        expect(html.split('Nested object description').length - 1).toBe(1);
      });
    });

    describe('Show minProperties/maxProperties constraints', () => {
      const schema = new SchemaModel(
        parser,
        {
          properties: {
            name: {
              type: 'object',
              minProperties: 1,
              properties: {
                address: {
                  type: 'string',
                },
              },
            },
          },
        },
        '',
        options,
      );
      const component = shallow(withTheme(<Schema schema={schema} />));
      expect(component.html().includes('non-empty')).toBe(true);
    });

    describe('Show range minProperties/maxProperties constraints', () => {
      const schema = new SchemaModel(
        parser,
        {
          properties: {
            name: {
              type: 'object',
              minProperties: 2,
              maxProperties: 10,
              additionalProperties: {
                type: 'string',
              },
            },
          },
        },
        '',
        options,
      );
      it('should includes [ 2 .. 10 ] properties', () => {
        const component = shallow(withTheme(<Schema schema={schema} />));
        expect(component.html().includes('[ 2 .. 10 ] properties')).toBe(true);
      });
    });
  });
});
