import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeckList from '../DeckList.vue'

const mockCards = [
  { id: 1, question: 'Was ist Vue?', answer: 'Ein JS-Framework', learned: false },
  { id: 2, question: 'Was ist Java?', answer: 'Eine Programmiersprache', learned: true },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string, options?: any) => {
    if (!options || options.method === 'GET' || !options.method) {
      return Promise.resolve({ json: () => Promise.resolve(mockCards) })
    }
    return Promise.resolve({ json: () => Promise.resolve({}) })
  }))
})

describe('DeckList', () => {
  it('zeigt alle Karten an', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    expect(wrapper.text()).toContain('Was ist Vue?')
    expect(wrapper.text()).toContain('Was ist Java?')
  })

  it('filtert Karten per Suchfeld', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await wrapper.find('input[placeholder="Karten durchsuchen..."]').setValue('Vue')
    expect(wrapper.text()).toContain('Was ist Vue?')
    expect(wrapper.text()).not.toContain('Was ist Java?')
  })

  it('zeigt gelernte Karten mit Häkchen an', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    expect(wrapper.text()).toContain('✓ Gelernt')
  })

  it('Lernmodus startet bei Klick auf Button', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await wrapper.find('.learn-btn').trigger('click')
    expect(wrapper.text()).toContain('Karte 1 /')
  })
})
