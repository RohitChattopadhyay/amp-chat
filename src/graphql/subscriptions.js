/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateConvoLink = /* GraphQL */ `
  subscription OnCreateConvoLink($convoLinkUserId: ID!) {
    onCreateConvoLink(convoLinkUserId: $convoLinkUserId) {
      id
      user {
        id
        username
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      convoLinkUserId
      conversation {
        id
        members
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      convoLinkConversationId
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage($messageConversationId: ID!) {
    onCreateMessage(messageConversationId: $messageConversationId) {
      id
      author {
        id
        username
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      authorId
      img
      content
      conversation {
        id
        members
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      messageConversationId
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
