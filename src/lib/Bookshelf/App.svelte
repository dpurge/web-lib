<script lang="ts">
    import type { BookshelfProps } from './interface'

    let {
        title = "Bookshelf"
    }: BookshelfProps = $props()
</script>

<div class="bookshelf">
    This is {title}!
</div>

<style>
</style>
