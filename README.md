# showtime.js
A framework for easily creating stunning tours around your web app.

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
