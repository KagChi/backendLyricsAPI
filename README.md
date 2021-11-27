# backendLyricsAPI
A private backend API Provided for NezukoChan, how ever you can self host your own. but you didnt get any help or support

### Request API
- "/search" [POST]
body: 
  - auth [REQUIRED]
  - q [REQUIRED]
- "/lyrics/:id" [POST]
 body:
  - auth [REQUIRED]