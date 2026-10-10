import { useState } from 'react';
import { Checkbox } from '../../components/m3/Checkbox';
import { AssistChip, ChoiceChips, FilterChip } from '../../components/m3/Chips';
import { SegmentedButton } from '../../components/m3/SegmentedButton';
import { Select } from '../../components/m3/Select';
import { TextField } from '../../components/m3/TextField';
import { COLORS, type Color } from '@vlf/shared';
import { colorLabel, colorSwatch } from '../../lib/itemColor';
import { GallerySection, Specimen } from './GallerySection';

const COLOR_OPTIONS = COLORS.map((c) => ({ value: c, label: colorLabel(c) }));

export function TextFieldsGallery() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('not-an-email');
  const [when, setWhen] = useState('');
  const [desc, setDesc] = useState('');
  const [pw, setPw] = useState('demo1234');
  const [search, setSearch] = useState('backpack');
  const [cat, setCat] = useState('');
  return (
    <GallerySection id="text-fields" title="Text fields & select" note="Outlined, 56px, floating label in the outline notch.">
      <div className="md-grid">
        <TextField label="Where did you lose it?" value={name} onChange={setName} leadingIcon="location_on" supportingText="e.g. Gate 3" required />
        <TextField label="Email" type="email" value={email} onChange={setEmail} error="Enter a valid email address" />
        <TextField label="Lost between" type="datetime-local" value={when} onChange={setWhen} />
        <TextField label="Password" type="password" value={pw} onChange={setPw} />
        <TextField
          label="Search"
          value={search}
          onChange={setSearch}
          leadingIcon="search"
          trailingIcon="close"
          trailingIconLabel="Clear search"
          onTrailingIconClick={() => setSearch('')}
        />
        <TextField label="Disabled" value="Read only value" onChange={() => {}} disabled />
        <Select
          label="Category"
          value={cat}
          onChange={setCat}
          placeholder="Any category"
          leadingIcon="category"
          options={[{ value: 'phone', label: 'Phone' }, { value: 'wallet', label: 'Wallet' }, { value: 'bag', label: 'Bag' }]}
        />
        <TextField label="Description" value={desc} onChange={setDesc} multiline rows={3} supportingText="Anything that helps identify it" />
      </div>
    </GallerySection>
  );
}

export function SelectionGallery() {
  const [filters, setFilters] = useState<Record<string, boolean>>({ stored: true });
  const [color, setColor] = useState<Color | ''>('');
  const [size, setSize] = useState<'s' | 'm' | 'l'>('m');
  const [view, setView] = useState<'list' | 'grid' | 'map'>('list');
  const [agree, setAgree] = useState(false);
  const [checked, setChecked] = useState(true);
  const toggle = (k: string) => setFilters((f) => ({ ...f, [k]: !f[k] }));
  return (
    <GallerySection id="selection" title="Chips, checkbox, segmented button">
      <Specimen label="FilterChip">
        <div className="md-chip-set">
          {['found', 'stored', 'claim_pending'].map((k) => (
            <FilterChip key={k} label={k.replace('_', ' ')} selected={!!filters[k]} onClick={() => toggle(k)} />
          ))}
          <FilterChip label="With icon" icon="schedule" selected={!!filters.icon} onClick={() => toggle('icon')} />
          <FilterChip label="Disabled" selected={false} onClick={() => {}} disabled />
        </div>
      </Specimen>
      <Specimen label="ChoiceChips + swatch">
        <ChoiceChips options={COLOR_OPTIONS} value={color} onChange={setColor} ariaLabel="Item color" swatch={colorSwatch} />
      </Specimen>
      <Specimen label="ChoiceChips + icons">
        <ChoiceChips
          options={[{ value: 's', label: 'Small', icon: 'smartphone' }, { value: 'm', label: 'Medium', icon: 'backpack' }, { value: 'l', label: 'Large', icon: 'checkroom' }] as const}
          value={size}
          onChange={setSize}
          ariaLabel="Size"
        />
      </Specimen>
      <Specimen label="AssistChip">
        <div className="md-chip-set">
          <AssistChip label="Open search" icon="search" to="/search" />
          <AssistChip label="Copy link" icon="content_copy" onClick={() => {}} />
        </div>
      </Specimen>
      <Specimen label="Checkbox">
        <div className="md-stack md-stack--xs">
          <Checkbox checked={agree} onChange={setAgree} label="ID was checked against the claim" />
          <Checkbox checked={checked} onChange={setChecked} label="Email the owner" />
        </div>
      </Specimen>
      <Specimen label="SegmentedButton">
        <SegmentedButton
          options={[{ value: 'list', label: 'List', icon: 'menu' }, { value: 'grid', label: 'Grid', icon: 'dashboard' }, { value: 'map', label: 'Map', icon: 'location_on' }] as const}
          value={view}
          onChange={setView}
          ariaLabel="View"
        />
      </Specimen>
    </GallerySection>
  );
}
