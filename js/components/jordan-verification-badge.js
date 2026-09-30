import { officialStampsData } from '../data/stamps.data.js';

let badgeSequence = 0;

const outerStarPath = 'M50 4 L59 29 L86 21 L72 45 L95 60 L68 64 L70 91 L50 73 L30 91 L32 64 L5 60 L28 45 L14 21 L41 29 Z';
const innerStarPath = 'M50 14 L57 32 L77 26 L66 44 L83 55 L64 58 L65 78 L50 65 L35 78 L36 58 L17 55 L34 44 L23 26 L43 32 Z';
const jordanStarPath = 'M15.5 39.5 L17.7 45.5 L23.7 43.5 L20.4 48.9 L25.2 52.3 L19.4 53.1 L19.6 59.5 L15.5 55 L11.4 59.5 L11.6 53.1 L5.2 52.3 L10.6 48.9 L7.3 43.5 L13.4 45.5 Z';

export const defaultExplorerStampIds = officialStampsData.map((stamp) => stamp.id);

export function hasCollectedAllOfficialStamps(userOrStampIds) {
  const stampIds = Array.isArray(userOrStampIds) ? userOrStampIds : userOrStampIds?.stamps;
  return Array.isArray(stampIds) && officialStampsData.every((stamp) => stampIds.includes(stamp.id));
}

export function renderJordanVerificationBadge(sizeClass = 'h-7 w-7', label = 'شارة التوثيق الأردنية') {
  const clipId = `jordan-verified-star-${++badgeSequence}`;

  return `
    <span class="jordan-verification-badge ${sizeClass}" role="img" aria-label="${label}" title="${label}" style="display:inline-flex;flex:none;align-items:center;justify-content:center;vertical-align:middle;">
      <svg viewBox="0 0 100 100" class="h-full w-full" aria-hidden="true" focusable="false">
        <path d="${outerStarPath}" fill="#FDE68A" />
        <defs>
          <clipPath id="${clipId}">
            <path d="${innerStarPath}" />
          </clipPath>
        </defs>
        <g clip-path="url(#${clipId})">
          <rect width="100" height="34" fill="#000000" />
          <rect y="33" width="100" height="34" fill="#FFFFFF" />
          <rect y="66" width="100" height="34" fill="#007A3D" />
          <path d="M0 0 L51 50 L0 100 Z" fill="#CE1126" />
          <path d="${jordanStarPath}" fill="#FFFFFF" />
        </g>
        <path d="${outerStarPath}" fill="none" stroke="#8A4B08" stroke-width="2.5" />
      </svg>
    </span>
  `;
}
