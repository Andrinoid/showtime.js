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



Example code
```javascript
var tour = new Showtime({
    debug: true,
    autoplay: false,
    padding: 10,
    removeOnOuterClick: true,
    focusClick: function () {
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
.show({
    element: '.ball',
    title: 'hey I have a title again.',
    placement: 'right',
    content: '<p>This is a ball</p>',
    padding: 10,
    dimentions: {
        height: 400
    },
    focusClick: function () {
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
    element: '.four',
    placement: 'top',
    content: '<p>This is a box2</p>'
})
.show({
    element: '.two',
    placement: 'bottom',
    content: '<p>This is a box1</p>',
    focusClick: function () {
        alert();
        tour.next();
    }
})
.show({
    element: '.three',
    placement: 'left',
    content: '<p>This is a box2</p>'
});
```
