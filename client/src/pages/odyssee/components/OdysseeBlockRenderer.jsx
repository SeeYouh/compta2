import { useState } from 'react';

import { CATALOGUE_FIELDS, PASSENGER_FIELDS } from '../config/fieldDefinitions';
import { getFontFamily } from '../config/fontDefinitions';
import OdysseeBlockFormatToolbar from './OdysseeBlockFormatToolbar';

// Convertit le style persisté d'un fieldPlacement en style inline CSS.
// text-align et text-decoration se propagent de la cellule à son contenu inline.
function cssFromFieldStyle(style) {
  return {
    textAlign: style.textAlign,
    fontWeight: style.fontWeight,
    textDecoration: style.textDecoration,
    fontFamily: getFontFamily(style.fontFamily),
  };
}

function resolvePath(obj, path) {
  const normalized = path.startsWith('contentFilesData.')
    ? path.slice('contentFilesData.'.length)
    : path;
  return normalized.split('.').reduce((acc, key) => acc?.[key], obj);
}

function renderValue(value, type) {
  if (value == null || value === '') return null;

  switch (type) {
    case 'text':
    case 'number':
    case 'date':
    case 'enum':
      return <span className="ody-block-renderer__text">{String(value)}</span>;

    case 'image':
      return value
        ? <img className="ody-block-renderer__img" src={value} alt="" />
        : null;

    case 'images': {
      const first = Array.isArray(value) ? value[0] : null;
      return first?.adress
        ? <img className="ody-block-renderer__img" src={first.adress} alt={first.alt || ''} />
        : null;
    }

    case 'alias':
      return value?.activate && value?.name
        ? <span className="ody-block-renderer__text">{value.name}</span>
        : null;

    case 'array':
      if (!Array.isArray(value) || value.length === 0) return null;
      if (typeof value[0] === 'object') {
        return (
          <span className="ody-block-renderer__text">
            {value.map((v) => v.handle || v.name || '').filter(Boolean).join(', ')}
          </span>
        );
      }
      return <span className="ody-block-renderer__text">{value.join(', ')}</span>;

    case 'infoSupp':
      if (!Array.isArray(value) || value.length === 0) return null;
      return (
        <span className="ody-block-renderer__text">
          {value.length} bloc{value.length > 1 ? 's' : ''}
        </span>
      );

    default:
      return <span className="ody-block-renderer__text">{String(value)}</span>;
  }
}

const OdysseeBlockRenderer = ({
  blockDef,
  contentFilesData,
  sourceType,
  editable = false,
  onFieldStyleChange,
}) => {
  const { columns, rows, fieldPlacements } = blockDef;
  const fields = sourceType === 'passenger' ? PASSENGER_FIELDS : CATALOGUE_FIELDS;

  // Cellule survolée en mode éditable : { fieldId, rect } — rect sert à
  // positionner la toolbar en fixed (échappe aux overflow: hidden parents)
  const [hovered, setHovered] = useState(null);

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
        let content = null;

        if (contentFilesData && fieldDef) {
          const value = resolvePath(contentFilesData, fieldDef.path);
          content = renderValue(value, fieldDef.type);
        }

        // Fallback : affiche le label du champ (mode template ou valeur vide)
        if (!content && fieldDef) {
          content = <span className="ody-block-renderer__label">{fieldDef.label}</span>;
        }

        const isHovered = editable && hovered?.fieldId === placement.fieldId;

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
              ...(placement.style ? cssFromFieldStyle(placement.style) : {}),
            }}
            onMouseEnter={
              editable
                ? (e) =>
                    setHovered({
                      fieldId: placement.fieldId,
                      rect: e.currentTarget.getBoundingClientRect(),
                    })
                : undefined
            }
            onMouseLeave={editable ? () => setHovered(null) : undefined}
          >
            {content}
            {isHovered && placement.style && (
              <OdysseeBlockFormatToolbar
                anchorRect={hovered.rect}
                style={placement.style}
                onChange={(prop, value) =>
                  onFieldStyleChange?.(placement.fieldId, prop, value)
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OdysseeBlockRenderer;
