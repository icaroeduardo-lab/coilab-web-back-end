import { ChecklistItem } from './checklist-item.entity';

const makeItem = (
  overrides: Partial<{ id: string; label: string; checked: boolean; order: number }> = {},
) =>
  new ChecklistItem({
    id: '550e8400-e29b-41d4-a716-446655440001',
    label: 'Item de checklist',
    checked: false,
    order: 0,
    ...overrides,
  });

describe('ChecklistItem', () => {
  it('cria item com valores corretos', () => {
    const item = makeItem();
    expect(item.getId()).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(item.getLabel()).toBe('Item de checklist');
    expect(item.isChecked()).toBe(false);
    expect(item.getOrder()).toBe(0);
  });

  it('remove espaços do label', () => {
    const item = makeItem({ label: '  Teste  ' });
    expect(item.getLabel()).toBe('Teste');
  });

  it('lança exceção quando label é vazio', () => {
    expect(() => makeItem({ label: '' })).toThrow('Label do item de checklist não pode ser vazio');
  });

  it('lança exceção quando label contém apenas espaços', () => {
    expect(() => makeItem({ label: '   ' })).toThrow(
      'Label do item de checklist não pode ser vazio',
    );
  });

  describe('toggle()', () => {
    it('muda checked de false para true', () => {
      const item = makeItem({ checked: false });
      item.toggle();
      expect(item.isChecked()).toBe(true);
    });

    it('muda checked de true para false', () => {
      const item = makeItem({ checked: true });
      item.toggle();
      expect(item.isChecked()).toBe(false);
    });
  });

  describe('updateOrder()', () => {
    it('atualiza order corretamente', () => {
      const item = makeItem({ order: 0 });
      item.updateOrder(3);
      expect(item.getOrder()).toBe(3);
    });

    it('aceita order igual a zero', () => {
      const item = makeItem({ order: 5 });
      item.updateOrder(0);
      expect(item.getOrder()).toBe(0);
    });

    it('lança exceção quando order é negativo', () => {
      const item = makeItem();
      expect(() => item.updateOrder(-1)).toThrow(
        'Ordem do item de checklist deve ser um inteiro não negativo',
      );
    });

    it('lança exceção quando order não é inteiro', () => {
      const item = makeItem();
      expect(() => item.updateOrder(1.5)).toThrow(
        'Ordem do item de checklist deve ser um inteiro não negativo',
      );
    });
  });
});
