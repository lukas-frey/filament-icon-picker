<div class="flex flex-col items-center justify-center">
    <div class="relative flex !h-16 w-full flex-col items-center justify-center py-2">
        <div class="grow-1 relative h-12 w-12 shrink-0 gap-1">
            {{--
                using x-icon clashes with wireui, tries to render their x-icon component }}
                {{-- <x-icon name="{{$icon}}" class="w-full h-full absolute" />
            --}}
            @svg($icon, ['class' => 'w-full h-full absolute'])
            {{-- Ugly fix for choices.js not registering clicks on SVGs. --}}
            <div class="absolute z-10 h-full w-full"></div>
        </div>
        <small class="h-4 w-full shrink-0 grow-0 truncate text-center">
            {{ $icon }}
        </small>
    </div>
</div>
