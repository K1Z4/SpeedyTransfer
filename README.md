# SpeedyTransfer
Transfer messages between devices.

## Tech

The service works with the concept of 'rooms'.

The room key is a GUID. This is used for the room authentication just like an API key.

### Create room

A client can go the endpoint which will send a response with a new cookie.

The rooms are displayed at the bottom of the home page. 

Clicking on a room will show you a QR code and a link which will allow another client to join your room.

### Join room

Via QR code or link. Visiting the url sets a cookie with the room key.