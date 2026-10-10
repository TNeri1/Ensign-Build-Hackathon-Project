import { PageHeader } from '../../components/m3/PageHeader';
import { ButtonsGallery, CardsGallery, ListsGallery, MenuGallery } from './GalleryActions';
import { AlertsGallery, EmptyProgressGallery, OverlaysGallery, PageHeaderGallery, StatusGallery } from './GalleryFeedback';
import { SelectionGallery, TextFieldsGallery } from './GalleryInputs';
import { ColorGallery, ShapeElevationGallery, TypescaleGallery } from './GalleryTokens';
import './Components.css';

const TOC = [
  ['buttons', 'Buttons'], ['cards', 'Cards'], ['lists', 'Lists'], ['menu', 'Menu'], ['status', 'Status'],
  ['alerts', 'Alerts'], ['empty', 'Empty & progress'], ['overlays', 'Dialogs & snackbars'],
  ['page-header', 'Page header'], ['text-fields', 'Text fields'], ['selection', 'Selection'],
  ['typescale', 'Typescale'], ['colors', 'Colors'], ['shape', 'Shape & elevation'],
];

/** Dev-only visual reference for every components/m3 component and the theme tokens. Route: /dev/components */
export function Components() {
  return (
    <div className="app-page app-page--wide gallery">
      <PageHeader title="Component gallery" subtitle="Material 3 components in components/m3 and the theme tokens. Import each from its own file." />
      <nav className="gallery-toc" aria-label="Gallery sections">
        {TOC.map(([id, label]) => (
          <a key={id} href={`#${id}`}>{label}</a>
        ))}
      </nav>
      <ButtonsGallery />
      <CardsGallery />
      <ListsGallery />
      <MenuGallery />
      <StatusGallery />
      <AlertsGallery />
      <EmptyProgressGallery />
      <OverlaysGallery />
      <PageHeaderGallery />
      <TextFieldsGallery />
      <SelectionGallery />
      <TypescaleGallery />
      <ColorGallery />
      <ShapeElevationGallery />
    </div>
  );
}
