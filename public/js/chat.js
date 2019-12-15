const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

socket.on('countUpdated',(count) => {
    console.log('the count has been updated: '+count)
})

socket.on('message',(message) => {
    console.log(message)

})

const autoscroll = () => {
    // New mesasge element
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    const scrollOffset =  $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
    
}

socket.on('locationMessage',(message) => {
    console.log(message)

    const html = Mustache.render(locationTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('broadcastMessage',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users}) => {
    console.log("roomdata",room)
    console.log("roomdata_users",users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html

})

document.querySelector('#increment').addEventListener('click', () => {
    console.log('Clicked!')
    socket.emit('increment')
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    //(const message = document.querySelector('input').value
    const message = e.target.elements.message.value

    console.log('new message to send to server: '+message)

    socket.emit('sendMessage',message, (error) => {
        
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log('error: ',error)
        }
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {

    $sendLocationButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation) {
        return alert('Geolocation not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        
        console.log(position)
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location shared!")
        })
    })
    

})

socket.emit('join',{username, room}, (error) => {  
    if (error) {
        alert(error)
        location.href = "/"
    }
})