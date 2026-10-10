import { Button } from '../../components/m3/Button';
import { Card } from '../../components/m3/Card';
import { Fab } from '../../components/m3/Fab';
import { Icon } from '../../components/m3/Icon';
import { IconButton } from '../../components/m3/IconButton';
import { LinkButton } from '../../components/m3/LinkButton';
import { List, ListItem } from '../../components/m3/ListItem';
import { Menu } from '../../components/m3/Menu';
import { StatusChip } from '../../components/m3/StatusChip';
import { useSnackbar } from '../../components/m3/Snackbar';
import { useState } from 'react';
import { GallerySection, Specimen } from './GallerySection';

const VARIANTS = ['filled', 'tonal', 'outlined', 'text', 'elevated'] as const;

export function ButtonsGallery() {
  const [fav, setFav] = useState(false);
  return (
    <GallerySection id="buttons" title="Buttons" note="Button / LinkButton: 40px, full radius, label-large. size='large' (56px) for primary form submits.">
      {VARIANTS.map((v) => (
        <Specimen key={v} label={v}>
          <Button variant={v}>Label</Button>
          <Button variant={v} icon="add">With icon</Button>
          <Button variant={v} trailingIcon="chevron_right">Trailing</Button>
          <Button variant={v} disabled>Disabled</Button>
        </Specimen>
      ))}
      <Specimen label="large + full">
        <Button size="large" full icon="send">Submit report</Button>
      </Specimen>
      <Specimen label="LinkButton">
        <LinkButton to="/search" icon="search">Go to search</LinkButton>
        <LinkButton to="/report" variant="outlined">Report lost</LinkButton>
      </Specimen>
      <Specimen label="IconButton">
        <IconButton icon="edit" label="Edit" />
        <IconButton icon="delete" label="Delete" variant="filled" />
        <IconButton icon="print" label="Print" variant="tonal" />
        <IconButton icon="content_copy" label="Copy" variant="outlined" />
        <IconButton icon="notifications" label="Toggle notifications" selected={fav} onClick={() => setFav(!fav)} />
        <IconButton icon="refresh" label="Refresh (disabled)" disabled />
      </Specimen>
      <Specimen label="FAB">
        <Fab icon="add" ariaLabel="Log item" />
        <Fab icon="photo_camera" variant="secondary" ariaLabel="Take photo" />
        <Fab icon="edit" variant="tertiary" ariaLabel="Edit" />
        <Fab icon="qr_code_scanner" variant="surface" ariaLabel="Scan" />
        <Fab icon="add" label="Log item" to="/staff/intake" />
      </Specimen>
    </GallerySection>
  );
}

export function CardsGallery() {
  const snackbar = useSnackbar();
  return (
    <GallerySection id="cards" title="Cards" note="Corner radius medium (12px). Elevated = surface-container-low + level1; filled = surface-container-highest; outlined = surface + outline-variant.">
      <div className="md-grid">
        {(['elevated', 'filled', 'outlined'] as const).map((v) => (
          <Card key={v} variant={v}>
            <div className="md-stack md-stack--sm">
              <h3>{v} card</h3>
              <p className="md-typescale-body-medium md-on-surface-variant">Black backpack found near Gate 3.</p>
              <div className="md-row md-row--end"><Button variant="text">Details</Button></div>
            </div>
          </Card>
        ))}
        <Card variant="outlined" onClick={() => snackbar.show('Card clicked')}>
          <h3>Clickable card</h3>
          <p className="md-typescale-body-medium md-on-surface-variant">Whole card is a button with a state layer.</p>
        </Card>
      </div>
    </GallerySection>
  );
}

export function ListsGallery() {
  const snackbar = useSnackbar();
  return (
    <GallerySection id="lists" title="Lists" note="56 / 72 / 88px rows. Leading: icon, .md-list-item__avatar or .md-list-item__image.">
      <Card variant="outlined" className="md-card--flush">
        <List>
          <ListItem headline="One line item" leading={<Icon name="inbox" />} trailing={<Icon name="chevron_right" />} to="/outbox" />
          <ListItem
            headline="Black backpack"
            supporting="Gate 3 · found 2h ago"
            leading={<span className="md-list-item__avatar"><Icon name="backpack" /></span>}
            trailing={<StatusChip state="stored" />}
            onClick={() => snackbar.show('Row clicked')}
          />
          <ListItem
            overline="BIN A-12"
            headline="iPhone 14, blue case"
            supporting="Main concourse, near the food court. Lock screen shows a dog photo."
            leading={<span className="md-list-item__image gallery-image-placeholder"><Icon name="smartphone" /></span>}
            trailing={<span className="md-typescale-label-small">3d</span>}
          />
          <ListItem headline="Static row (not interactive)" supporting="No to / onClick" leading={<Icon name="info" />} />
        </List>
      </Card>
    </GallerySection>
  );
}

export function MenuGallery() {
  const snackbar = useSnackbar();
  return (
    <GallerySection id="menu" title="Menu">
      <Specimen label="Menu">
        <Menu
          anchorLabel="Item actions"
          items={[
            { label: 'Edit', icon: 'edit', onClick: () => snackbar.show('Edit') },
            { label: 'Print label', icon: 'print', onClick: () => snackbar.show('Print') },
            { label: 'Open search', icon: 'open_in_new', to: '/search' },
            { label: 'Delete', icon: 'delete', onClick: () => snackbar.show('Deleted', { actionLabel: 'Undo', onAction: () => snackbar.show('Restored') }) },
          ]}
        />
        <Menu anchorLabel="Filter" icon="filter_list" items={[{ label: 'Newest first' }, { label: 'Oldest first' }]} />
      </Specimen>
    </GallerySection>
  );
}
