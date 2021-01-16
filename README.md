Chat application in AWS Amplify
---

## Problem Statement
Write a multi-client chat application consisting of both client and server programs. In this chat application simultaneously several clients can communicate with each other. For this you need a single server program that clients connect to. The client programs send the chat text or image (input) to the server and then the server distributes that message (text or image) to all the other clients. Each client then displays the message sent to it by the server. The server should be able to handle several clients concurrently. It should work fine as clients come and go.  
Develop the application using a framework based on Node.JS. How are messages handled concurrently? Which web application framework(s) did you follow? Prepare a detailed report of the experiments you have done, and your observations on the protocol layers thus created.

## Solution Approach
The assignment can be split into following sub parts
### Frontend
The Frontend is a Static Web Page which is developed using [Preactjs](https://preactjs.com/).

**Login Page**  
![](https://i.imgur.com/otrTOFO.png)  
**Home Page**  
![](https://i.imgur.com/hw5b92x.png)  
**Chat Screen**  
![](https://i.imgur.com/lFq2FBe.png)
### Backend
The backend is a [GraphQL API](https://graphql.org/). A NoSQL database is being used having following schema.
```graphql
type User
@model
@auth(rules: [
	{ allow: owner, ownerField: "id", queries: null },
	{ allow: private, operations: [create] },
]) {
	id: ID!
	username: String!
	conversations: [ConvoLink] @connection(name: "UserLinks")
	messages: [Message] @connection(name: "UserMessages")
	createdAt: String
	updatedAt: String
}

type Conversation
@model(
	mutations: { create: "createConvo", update: "addUser" }
	queries: { get: "getConvo" }
	subscriptions: null
)
@auth(rules: [
	{ allow: private, operations: [create, read, update]}
]) {

	id: ID!
	messages: [Message] @connection(name: "ConvoMsgs", sortField: "createdAt")
	associated: [ConvoLink] @connection(name: "AssociatedLinks")
	members: [String!]
	createdAt: String
	updatedAt: String
}

type Message
@model(subscriptions: null, queries: null)
@auth(rules: [{ allow: owner, ownerField: "authorId", operations: [create, update, delete]}]) {
	id: ID!
	author: User @connection(name: "UserMessages", keyField: 		"authorId")
	authorId: String
	img: String
	content: String!
	conversation: Conversation! @connection(name: "ConvoMsgs")
	messageConversationId: ID!
	createdAt: String
	updatedAt: String
}

type ConvoLink
@model(
	mutations: { create: "createConvoLink", update: "updateConvoLink" }
	queries: null
	subscriptions: null
) {
	id: ID!
	user: User! @connection(name: "UserLinks")
	convoLinkUserId: ID
	conversation: Conversation! @connection(name: "AssociatedLinks")
	convoLinkConversationId: ID!
	createdAt: String
	updatedAt: String
}
```
## Salient Features
-	**Broadcast, Multicast, Unicast**  
	The web app can send message to all users , to a group and to a specific user
-	**Real Time Chat**  
	Using web-socket framework [Socket.io](), the messages are being delivered
-	**Persistant Chat**  
	The messages are stored in database and thus the application works even if the receipent is offline
-    **Image Support**  
	 Images are being uploaded to a 3rd party storage service and the link is being shared as message. This link is identified in user interface and the image is displayed
-    **Mobile Responsive**
## Sample Output
**User Interface**  
![](https://i.imgur.com/AlZ2Tzb.png)  

**New Room Creation**  
![](https://i.imgur.com/LrnVO3x.png)

**Image with Caption**  
![](https://i.imgur.com/JvqAAcU.png)

**Emoji supported Chat**  
![](https://i.imgur.com/duhBAFD.png)

**The Other User in the Conversation**  
![](https://i.imgur.com/lDp3lYK.png)
