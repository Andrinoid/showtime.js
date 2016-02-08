# showtime.js

Showtime is a lightweight framework for easily creating stunning tours around your web app.
It comes with built in chain. so its really easy to mix your tours with custom functionality.

### Usage
Download showtime.js and include it in your html.
```html
<script src="showtime.js"></script>

<div class="element">Lorem ipsum</div>
<script>
var tour = new Showtime()
    .show({
        element: document.querySelector('.element'),
        title: 'hey I have a title.',
        content: '<p>This is the tooltip content</p>',
        placement: 'right',
        buttons: [
            {
                label: 'quit',
                click: function () {
                    tour.quit()
                }
            },
            {
                label: 'next',
                click: function () {
                    tour.next()
                }
            }
        ]
    })
    .call(function () {
        alert('This was a short tour');
    });
</script>
```
From this point you can chain as many show and call function you like to the showtime chain.
Sometimes this you end up with a lot of repetitions. so to make your code pretty you can define global defaults for the chain like in the example below.

Example code
```javascript
var tour = new Showtime({ 
    //these options will become default for all .show functions chained on this instance
    padding: 10,
    removeOnOuterClick: true,
    focusClick: function () {
        tour.next();
    },
    buttons: [
        {
            label: 'Quit',
            click: function () {
                tour.quit()
            }
        },
        {
            label: 'Next',
            click: function () {
                tour.next()
            }
        }
    ]
})
.show({
    element: '.leftMenu',
    title: 'hey I have a title again.',
    placement: 'right',
    content: '<p>This is a ball</p>',
    dimentions: {
        height: 400 // We can override the dementions of the focuspoint. top, left, height, width
    },
    focusClick: function () { // Hijack the event for the selected element to do whatever you want
        tour.next();
    },
    buttons: [
        {
            label: 'quit',
            click: function () {
                tour.quit()
            }
        },
        {
            label: 'next',
            click: function () {
                tour.next()
            }
        }
    ]
})
.call(function () {
    console.log('foobar');
})
.show({
    element: '.topMenu',
    placement: 'top',
    content: '<p>Lorem ipsum</p>'
})
.show({
    element: '.filterButtons',
    placement: 'bottom',
    content: '<p>Lorem ipsum</p>',
    focusClick: function () {
        alert('that's all folks')
    }
});
```

### Controls
...

### Options
...
