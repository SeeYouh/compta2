import { CATALOGUE_FIELDS, PASSENGER_FIELDS } from '../config/fieldDefinitions';
import { cssFromFormat } from '../utils/fieldFormat';
import OdysseeFieldEditor from './OdysseeFieldEditor';

function resolvePath(obj, path) {
  const normalized = path.startsWith('contentFilesData.')
    ? path.slice('contentFilesData.'.length)
    : path;
  return normalized.split('.').reduce((acc, key) => acc?.[key], obj);
}

function valueToText(value, type) {
  if (value == null || value === '') return null;

  switch (type) {
    case 'alias':
      return value?.activate && value?.name ? value.name : null;

    case 'array':
      if (!Array.isArray(value) || value.length === 0) return null;
      if (typeof value[0] === 'object') {
        return value.map((v) => v.handle || v.name || '').filter(Boolean).join(', ');
      }
      return value.join(', ');

    case 'infoSupp':
      if (!Array.isArray(value) || value.length === 0) return null;
      return `${value.length} bloc${value.length > 1 ? 's' : ''}`;

    default:
      return String(value);
  }
}

function renderImageValue(value, type) {
  if (type === 'image') {
    return value
      ? <img className="ody-block-renderer__img" src={value} alt="" />
      : null;
  }
  const firstImage = Array.isArray(value) ? value[0] : null;
  return firstImage?.adress
    ? <img className="ody-block-renderer__img" src={firstImage.adress} alt={firstImage.alt || ''} />
    : null;
}

const OdysseeBlockRenderer = ({
  blockDef,
  contentFilesData,
  sourceType,
  editable = false,
  onFieldEditorChange,
}) => {
  const { columns, rows, fieldPlacements } = blockDef;
  const fields = sourceType === 'passenger' ? PASSENGER_FIELDS : CATALOGUE_FIELDS;

  return (
    <div
      className="ody-block-renderer"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {(fieldPlacements ?? []).map((placement) => {
        const fieldDef = fields.find((f) => f.id === placement.fieldId);
        const isImageType = fieldDef?.type === 'image' || fieldDef?.type === 'images';

        let content = null;

        if (isImageType) {
          if (contentFilesData && fieldDef) {
            content = renderImageValue(
              resolvePath(contentFilesData, fieldDef.path),
              fieldDef.type,
            );
          }
        } else if (editable && fieldDef) {
          // MODE_TEMPLATE : toolbar sur le champ entier, label comme prévisualisation
          content = (
            <OdysseeFieldEditor
              fieldFormat={placement.fieldFormat}
              fallbackLabel={fieldDef.label}
              onChange={(fmt) => onFieldEditorChange?.(placement.fieldId, fmt)}
            />
          );
        } else if (fieldDef) {
          // MODE_DOCUMENT / lecture seule : valeur réelle (ou label) + formatage appliqué
          const text = contentFilesData
            ? valueToText(resolvePath(contentFilesData, fieldDef.path), fieldDef.type)
            : null;
          content = (
            <span
              className="ody-block-renderer__text"
              style={cssFromFormat(placement.fieldFormat)}
            >
              {text ?? fieldDef.label}
            </span>
          );
        }

        return (
          <div
            key={placement.fieldId}
            className={[
              'ody-block-renderer__cell',
              !contentFilesData ? 'ody-block-renderer__cell--template' : '',
              editable ? 'ody-block-renderer__cell--editable' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              gridColumn: `${placement.colStart} / span ${placement.colSpan}`,
              gridRow: `${placement.rowStart} / span ${placement.rowSpan}`,
            }}
            onDragStart={
              editable
                ? (e) => { e.preventDefault(); e.stopPropagation(); }
                : undefined
            }
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default OdysseeBlockRenderer;
