import { mount } from 'svelte'
import App from './App.svelte'

import type { BookshelfProps } from './interface'

export default function Bookshelf(id: string, props?: BookshelfProps) {
    const target = document.getElementById(id)!

    if (target === null) {
        throw new Error(`Cannot find element with id: ${id}`)
    }

    const app = mount(App, {
        target: target,
        props: props ? props : {}
    })

    return app
}