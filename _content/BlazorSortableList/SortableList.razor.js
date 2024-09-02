export function init(id, group, pull, put, sort, handle, filter, component, forceFallback, cssForSelection, multiDragKey, avoidImplicitDeselect, fallbackOnBody, swapThreshold) {

    const DEBUG_MODE = true;
    if (DEBUG_MODE) {
        console.log("Init for Id:", id, "swapThreshold:", swapThreshold);
    }
    let multiDrag = (typeof cssForSelection !== 'undefined');

    let htmlElement = document.getElementById(id);

    //new Sortable(htmlElement,
    //    {
    //        multiDrag: true,
    //        selectedClass: 'selected',
    //        group: 'shared2alex', // set both lists to same group
    //        animation: 150,
    //        onUpdate: (event) => {
    //            console.log("onUpdate:");
    //            console.log(event);
    //        },
    //        onRemove: (event) => {
    //            console.log("onRemove:");
    //            console.log(event);
    //        },
    //        onSelect: (event) => {
    //            console.log("onSelect:");
    //            console.log(event);
    //            let children = Array.from(event.from.children);
    //            let index = children.indexOf(event.item);
    //            console.log(index);
    //        },
    //        onDeselect: (event) => {
    //            console.log("onDeselect:");
    //            console.log(event);
    //            let children = Array.from(event.to.children);
    //            let index = children.indexOf(event.item);
    //            console.log(index);
    //        }
    //    });

    var sortable = new Sortable(htmlElement, {
        animation: 200,
        group: {
            name: group,
            pull: pull || true,
            put: put
        },
        filter: filter || undefined,
        sort: sort,
        forceFallback: forceFallback,
        fallbackOnBody: fallbackOnBody, //true,
        handle: handle || undefined,

        multiDrag: multiDrag,
        selectedClass: cssForSelection,
        multiDragKey: multiDragKey,
        avoidImplicitDeselect: avoidImplicitDeselect,
        swapThreshold: swapThreshold, //0.65,
        onUpdate: (event) => {
            if (DEBUG_MODE) {
                console.log("onUpdate:");
                console.log(event);
            }


            let newIndex = event.newDraggableIndex;
            // in multi selection mode we have newIndicies only
            let newIndicies = Array.from(event.newIndicies);
            if (newIndicies.length > 0) {
                newIndex = newIndicies[0].index;

                // Revert the DOM to match the .NET state
                newIndicies.forEach((item) => {
                    //remove selection first
                    Sortable.utils.deselect(item.multiDragElement);

                    event.from.removeChild(item.multiDragElement);

                });

                let oldIndicies = Array.from(event.oldIndicies);
                oldIndicies.forEach((item) => {
                    event.to.insertBefore(item.multiDragElement, event.to.childNodes[item.index]);
                });
            } else {
                event.item.remove();
                event.to.insertBefore(event.item, event.to.childNodes[event.oldIndex]);
            }
            // Notify .NET to update its model and re-render
            component.invokeMethodAsync('OnUpdateJS',
                event.oldDraggableIndex,
                newIndex,
                event.from.id
            );
        },
        onRemove: (event) => {
            if (DEBUG_MODE) {
                console.log("onRemove:");
                console.log(event);
            }

            if (event.pullMode === 'clone') {
                // Remove the clone
                event.clone.remove();
            }

            let newIndex = event.newDraggableIndex;

            // in multi selection mode we have newIndicies only
            let newIndicies = Array.from(event.newIndicies);
            if (newIndicies.length > 0) {
                newIndex = newIndicies[0].index;

                // Revert the DOM to match the .NET state
                newIndicies.forEach((item) => {
                    //remove selection first
                    Sortable.utils.deselect(item.multiDragElement);

                    event.to.removeChild(item.multiDragElement);
                });

                let oldIndicies = Array.from(event.oldIndicies);
                oldIndicies.forEach((item) => {
                    event.from.insertBefore(item.multiDragElement, event.from.childNodes[item.index]);
                });
            } else {
                // Revert the DOM to match the .NET state
                event.item.remove();
                event.from.insertBefore(event.item, event.from.childNodes[event.oldIndex]);
            }

            // Notify .NET to update its model and re-render
            component.invokeMethodAsync('OnRemoveJS',
                event.oldDraggableIndex,
                newIndex,
                event.from.id,
                event.to.id);
        },
        onSelect: (event) => {
            if (DEBUG_MODE) {
                console.log("onSelect:");
                console.log(event);
            }

            let children = Array.from(event.from.children);
            let index = children.indexOf(event.item);
            if (DEBUG_MODE) {
                //console.log(children);
                console.log(index);
            }

            // Notify .NET to update its model and re-render
            component.invokeMethodAsync('OnSelectJS', event.from.id, index);
        },
        onDeselect: (event) => {
            if (DEBUG_MODE) {
                console.log("onDeselect:");
                console.log(event);
            }

            let children = Array.from(event.to.children);
            let index = children.indexOf(event.item);
            if (DEBUG_MODE) {
                console.log(index);
            }

            // Notify .NET to update its model and re-render
            component.invokeMethodAsync('OnDeselectJS', event.from.id, index);
        }
    });
}
