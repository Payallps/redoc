import { observer } from 'mobx-react';
import * as React from 'react';

import { SchemaModel } from '../../services/models';

import { PropertiesTable, PropertiesTableCaption } from '../../common-elements/fields-layout';
import { Field } from '../Fields/Field';
import { Markdown } from '../Markdown/Markdown';
import { DiscriminatorDropdown } from './DiscriminatorDropdown';
import { SchemaProps } from './Schema';

import { mapWithLast } from '../../utils';
import { OptionsContext } from '../OptionsProvider';

export interface ObjectSchemaProps extends SchemaProps {
  discriminator?: {
    fieldName: string;
    parentSchema: SchemaModel;
  };
  fieldParentsName?: string[];
}

export const ObjectSchema = observer(
  ({
    schema: { fields = [], title, description },
    showTitle,
    discriminator,
    skipReadOnly,
    skipWriteOnly,
    level,
    fieldParentsName,
  }: ObjectSchemaProps) => {
    const { expandSingleSchemaField, showObjectSchemaExamples, schemasExpansionLevel } =
      React.useContext(OptionsContext);

    const filteredFields = React.useMemo(
      () =>
        skipReadOnly || skipWriteOnly
          ? fields.filter(
              item =>
                !(
                  (skipReadOnly && item.schema.readOnly) ||
                  (skipWriteOnly && item.schema.writeOnly)
                ),
            )
          : fields,
      [skipReadOnly, skipWriteOnly, fields],
    );

    const expandByDefault =
      (expandSingleSchemaField && filteredFields.length === 1) || schemasExpansionLevel >= level!;

    const table = (
      <PropertiesTable>
        {showTitle && <PropertiesTableCaption>{title}</PropertiesTableCaption>}
        <tbody>
          {mapWithLast(filteredFields, (field, isLast) => {
            return (
              <Field
                key={field.name}
                isLast={isLast}
                field={field}
                expandByDefault={expandByDefault}
                fieldParentsName={Number(level) > 1 ? fieldParentsName : []}
                renderDiscriminatorSwitch={
                  discriminator?.fieldName === field.name
                    ? () => (
                        <DiscriminatorDropdown
                          parent={discriminator!.parentSchema}
                          enumValues={field.schema.enum}
                        />
                      )
                    : undefined
                }
                className={field.expanded ? 'expanded' : undefined}
                showExamples={showObjectSchemaExamples}
                skipReadOnly={skipReadOnly}
                skipWriteOnly={skipWriteOnly}
                showTitle={showTitle}
                level={level}
              />
            );
          })}
        </tbody>
      </PropertiesTable>
    );

    // A nested object's description is already shown in its parent field row
    // (FieldDetails); the top-level schema of a request body, response or
    // oneOf variant has no such row, so render it here.
    if (level === 1 && description) {
      return (
        <>
          <Markdown source={description} />
          {table}
        </>
      );
    }
    return table;
  },
);
