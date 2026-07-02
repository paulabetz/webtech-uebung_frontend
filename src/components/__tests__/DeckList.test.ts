import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeckList from '../DeckList.vue'

const mockCards = [
  { id: 1, question: 'Was ist Vue?', answer: 'Ein JS-Framework', learned: false, deckId: null },
  { id: 2, question: 'Was ist Java?', answer: 'Eine Programmiersprache', learned: true, deckId: 1 },
]

const mockDecks = [
  { id: 1, name: 'Programmierung' }
]

let cardsState: typeof mockCards = []

const goToManageTab = async (wrapper: ReturnType<typeof mount>) => {
  const btn = wrapper.findAll('button').find(b => b.text() === 'Karten verwalten')
  await btn?.trigger('click')
}

beforeEach(() => {
  cardsState = JSON.parse(JSON.stringify(mockCards))
  vi.stubGlobal('fetch', vi.fn((url: string, options?: any) => {
    if (url.includes('/decks')) {
      return Promise.resolve({ json: () => Promise.resolve(mockDecks) })
    }
    if (options?.method === 'PUT') {
      const id = Number(url.split('/').pop())
      const body = JSON.parse(options.body)
      cardsState = cardsState.map(c => (c.id === id ? { ...c, ...body } : c))
      // Simuliert ein Backend, das nach einem Update eine andere Reihenfolge liefert
      cardsState = [...cardsState].sort((a, b) => Number(a.learned) - Number(b.learned))
      return Promise.resolve({ json: () => Promise.resolve({}) })
    }
    if (!options || options.method === 'GET' || !options.method) {
      return Promise.resolve({ json: () => Promise.resolve(cardsState) })
    }
    return Promise.resolve({ json: () => Promise.resolve({}) })
  }))
})

describe('DeckList', () => {
  it('zeigt alle Karten an', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await goToManageTab(wrapper)
    expect(wrapper.text()).toContain('Was ist Vue?')
    expect(wrapper.text()).toContain('Was ist Java?')
  })

  it('filtert Karten per Suchfeld', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await goToManageTab(wrapper)
    await wrapper.find('input[placeholder="Karten durchsuchen..."]').setValue('Vue')
    expect(wrapper.text()).toContain('Was ist Vue?')
    expect(wrapper.text()).not.toContain('Was ist Java?')
  })

  it('zeigt gelernte Karten mit Häkchen an', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await goToManageTab(wrapper)
    expect(wrapper.text()).toContain('✓ Gelernt')
  })

  it('Lernmodus startet bei Klick auf Button', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await wrapper.find('.learn-btn').trigger('click')
    expect(wrapper.text()).toContain('Karte 1 /')
  })

  it('zeigt Fehlermeldung bei leeren Feldern', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await goToManageTab(wrapper)
    const createBtn = wrapper.findAll('button').find(b => b.text() === 'Karte erstellen')
    await createBtn?.trigger('click')
    expect(wrapper.text()).toContain('dürfen nicht leer sein')
  })

  it('filtert nur ungelernte Karten für den Lernmodus', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    const filterBtn = wrapper.findAll('button').find(b => b.text().includes('Nur ungelernte'))
    await filterBtn?.trigger('click')
    await wrapper.find('.learn-btn').trigger('click')
    expect(wrapper.text()).toContain('Was ist Vue?')
    expect(wrapper.text()).toContain('Karte 1 / 1')
  })

  it('zeigt Deck-Name bei Karte an', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await goToManageTab(wrapper)
    expect(wrapper.text()).toContain('Programmierung')
  })

  it('Lernen-Button ist deaktiviert wenn keine Karten vorhanden', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/decks')) return Promise.resolve({ json: () => Promise.resolve([]) })
      return Promise.resolve({ json: () => Promise.resolve([]) })
    }))
    const wrapper = mount(DeckList)
    await flushPromises()
    const learnBtn = wrapper.find('.learn-btn')
    expect(learnBtn.attributes('disabled')).toBeDefined()
  })

  it('Suchfeld ist initial leer', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await goToManageTab(wrapper)
    const searchInput = wrapper.find('input[placeholder="Karten durchsuchen..."]')
    expect((searchInput.element as HTMLInputElement).value).toBe('')
  })

  it('zeigt beide Karten wenn Suchfeld leer ist', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await goToManageTab(wrapper)
    expect(wrapper.text()).toContain('Was ist Vue?')
    expect(wrapper.text()).toContain('Was ist Java?')
  })

  it('Karten behalten nach dem Markieren als gelernt ihre feste Reihenfolge', async () => {
    const wrapper = mount(DeckList)
    await flushPromises()
    await goToManageTab(wrapper)

    const questionsBefore = wrapper.findAll('li strong').map(el => el.text())

    const toggleBtn = wrapper.findAll('button').find(b => b.text().includes('Als gelernt markieren'))
    await toggleBtn?.trigger('click')
    await flushPromises()

    const questionsAfter = wrapper.findAll('li strong').map(el => el.text())
    expect(questionsAfter).toEqual(questionsBefore)
  })
})
