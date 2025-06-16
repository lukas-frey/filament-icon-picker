import Fuse from 'fuse.js';

export default function iconPickerComponent({
                                                state,
                                                isDropdown,
                                                shouldCloseOnSelect,
                                                getSetUsing,
                                                getIconsUsing,
                                            }) {
    return {
        state,
        isDropdown,
        shouldCloseOnSelect,
        dropdownOpen: false,
        set: null,
        icons: [],
        search: '',
        selectedIcon: null,

        fuse: null,
        results: [],
        resultsVisible: [],
        resultsPerPage: 50,
        resultsIndex: 0,

        isLoading: false,

        async init() {
            this.updateSelectedIcon();
            await this.loadIcons()

            this.$watch('state', () => this.updateSelectedIcon())
        },

        deferLoadingState() {
            return setTimeout(() => this.isLoading = true, 150);
        },

        async loadIcons() {
            this.isLoading = true;
            // const isLoadingDeferId = this.deferLoadingState()
            return await getIconsUsing(this.set)
                .then((icons) => {
                    this.icons = icons;
                    this.createFuseObject()
                    this.resetSearchResults()
                    // clearTimeout(isLoadingDeferId)
                    this.isLoading = false;
                })
        },

        async loadSet() {
            this.isLoading = true;
            // const isLoadingDeferId = this.deferLoadingState()
            return await getSetUsing(this.state).then((set) => {
                this.set = set
                // clearTimeout(isLoadingDeferId)
                this.isLoading = false;
            })
        },

        afterStateUpdated() {
            this.updateSelectedIcon()
        },

        afterSetUpdated() {
            this.loadIcons()
        },

        async updateSelectedIcon(reloadIfNotFound = true) {
            const found = this.icons.find(icon => icon.id === this.state);
            if (found) {
                console.log('Found')
                this.selectedIcon = found.html;
            } else if (reloadIfNotFound) {
                console.log(`Icon [${this.state}] not found`)
                await this.loadSet()
                console.log(`Reloaded set: ${this.set}`)
                await this.loadIcons()
                await this.updateSelectedIcon(false)
            }
        },

        createFuseObject() {
            const options = {
                includeScore: true,
                keys: ['id']
            }

            this.fuse = new Fuse(this.icons, options)
        },

        resetSearchResults() {
            this.resultsPerPage = 50;
            this.resultsIndex = 0;
            this.results = this.icons;
            this.resultsVisible = [];
            this.addSearchResultsChunk();
        },

        setSelect: {
            // self: this,
            async ['x-on:change'](event) {
                const value = event.target.value;
                this.set = value ? value : null;

                this.afterSetUpdated()
            }
        },

        searchInput: {
            ['x-on:input.debounce'](event) {
                const value = event.target.value
                const isLoadingDeferId = this.deferLoadingState()

                if (value) {
                    this.resultsVisible = [];
                    this.resultsIndex = 0;
                    this.results = this.fuse.search(value).map(result => result.item);
                    this.addSearchResultsChunk()
                } else {
                    this.resetSearchResults()
                }
                clearTimeout(isLoadingDeferId)
                this.isLoading = false;
            },
        },

        dropdownTrigger: {
            ['x-on:click.prevent']() {
                this.dropdownOpen = true;
            }
        },

        dropdownMenu: {
            ['x-show']() {
                return !this.isDropdown || this.dropdownOpen
            },
            ['x-on:click.outside']() {
                this.dropdownOpen = false;
            }
            // [x-show="dropdown" x-on:click.outside="dropdown = false"]
        },

        addSearchResultsChunk() {
            const endIndex = this.resultsIndex + this.resultsPerPage;
            this.resultsVisible.push(...this.results.slice(this.resultsIndex, endIndex));
            this.resultsIndex = endIndex;
        },

        updateState(icon) {
            if (icon) {
                this.state = icon.id;
                this.selectedIcon = icon.html;
                if (this.shouldCloseOnSelect) {
                    this.$nextTick(() => this.dropdownOpen = false);
                }
            } else {
                this.state = null;
                this.selectedIcon = null;
            }
        }
    }
}
