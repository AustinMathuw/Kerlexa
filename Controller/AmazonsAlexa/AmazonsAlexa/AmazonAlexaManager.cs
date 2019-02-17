using UnityEngine;
using Amazon;
using Amazon.Runtime;
using Amazon.CognitoIdentity;
using Amazon.DynamoDBv2;
using System.Collections.Generic;
using Amazon.DynamoDBv2.Model;
using UnityEngine.EventSystems;
using System;
using PubNubAPI;

namespace AmazonsAlexa.Unity.AlexaCommunicationModule
{
    ///-------------------------------------------------------------------------------------------------
    /// <summary>   Amazon Alexa Manager </summary>
    ///
    /// <remarks>   Austin Wilson, 9/15/2018. </remarks>
    ///-------------------------------------------------------------------------------------------------

    public class AmazonAlexaManager
    {
        #region Public Variables
        ///-------------------------------------------------------------------------------------------------
        /// <summary>   Resets your player's channel. (Should be unique to the player) </summary>
        ///
        /// <value> The channel. </value>
        ///-------------------------------------------------------------------------------------------------

        public string channel
        {
            set
            {
                pubChannel = value + "B";
                subChannel = value + "A";
            }
        }

        ///-------------------------------------------------------------------------------------------------
        /// <summary>   Gets or Resets the player's DynanoDB table key. </summary>
        ///
        /// <value> The alexa user dynamo key. </value>
        ///-------------------------------------------------------------------------------------------------

        public string alexaUserDynamoKey
        {
            get
            {
                return mAlexaUserDynamoKey;
            }
            set
            {
                mAlexaUserDynamoKey = value;
                PlayerPrefs.SetString("alexaUserDynamoKey", value);
            }
        }

        /// <summary>   The message recieved callback. </summary>
        public Action<HandleMessageEventData> handleMessageCallback;

        /// <summary>   The connection status recieved callback. </summary>
        public Action<ConnectionStatusEventData> handleConnectionStatusCallback;
        #endregion

        #region Private Variables
        private long lastMessageTimestamp
        {
            get
            {
                return mLastMessageTimestamp;
            }
            set
            {
                mLastMessageTimestamp = value;
                PlayerPrefs.SetString("lastMessageTimestamp", value.ToString());
            }
        }
        private string pubChannel;
        private string subChannel;
        private string mAlexaUserDynamoKey;
        private long mLastMessageTimestamp;
        private string displayName = "Amazon Alexa: ";
        private bool debug = false;
        private string tableName;
        private string identityPoolId;
        private string AWSRegion;
        private PubNub pubnub;
        private Dictionary<string, AttributeValue> currentAttributes;
        private HandleMessageEventData handleMessageEventData;
        private MessageSentEventData messageSentEventData;
        private ErrorEventData errorEventData;
        private GetSessionAttributesEventData getSessionAttributesEventData;
        private SetSessionAttributesEventData setSessionAttributesEventData;
        private ConnectionStatusEventData connectionStatusEventData;
        private RegionEndpoint _AWSRegion
        {
            get { return RegionEndpoint.GetBySystemName(AWSRegion); }
        }
        private AWSCredentials _credentials;
        private AWSCredentials Credentials
        {
            get
            {
                if (_credentials == null)
                    _credentials = new CognitoAWSCredentials(identityPoolId, _AWSRegion);
                return _credentials;
            }
        }
        private IAmazonDynamoDB _dynamoClient;
        private IAmazonDynamoDB DynamoClient
        {
            get
            {
                if (_dynamoClient == null)
                {
                    _dynamoClient = new AmazonDynamoDBClient(Credentials, _AWSRegion);
                }

                return _dynamoClient;
            }
        }
        #endregion

        #region Public Methods
        ///-------------------------------------------------------------------------------------------------
        /// <summary>   AmazonAlexaManager Constructor. </summary>
        ///
        /// <remarks>   Austin Wilson, 9/15/2018. </remarks>
        ///
        /// <param name="publishKey">       Your PubNub publish key. </param>
        /// <param name="subscribeKey">     Your PubNub subscribe key. </param>
        /// <param name="channel">          Your player's channel. (Should be unique to the player) </param>
        /// <param name="tableName">        Name of your skill's DynamoDB table where the persistant attributes are stored. </param>
        /// <param name="identityPoolId">   Identifier of your AWS Cognito identity pool. </param>
        /// <param name="AWSRegion">        The AWS Region where your DynamoDB table and Cognito identity pool are hosted. </param>
        /// <param name="gameObject">       The GameObject you are attaching this manager instance to. </param>
        /// <param name="messageCallback">  The callback for when a message is recived from your Alexa Skill. </param>
        /// <param name="debug">            (Optional) True to debug. </param>
        ///-------------------------------------------------------------------------------------------------

        public AmazonAlexaManager(string publishKey, string subscribeKey, string channel, string tableName, string identityPoolId, string AWSRegion, GameObject gameObject, Action<HandleMessageEventData> messageCallback, Action<ConnectionStatusEventData> connectionStatusCallback, bool debug = false)
        {
            PNConfiguration pnConfiguration = new PNConfiguration();
            pnConfiguration.SubscribeKey = subscribeKey;
            pnConfiguration.PublishKey = publishKey;
            if (debug)
            {
                pnConfiguration.LogVerbosity = PNLogVerbosity.BODY;
            }

            pubnub = new PubNub(pnConfiguration);
            handleMessageCallback = messageCallback;
            handleConnectionStatusCallback = connectionStatusCallback;
            this.channel = channel;
            this.debug = debug;
            this.tableName = tableName;
            this.identityPoolId = identityPoolId;
            this.AWSRegion = AWSRegion;
            if (PlayerPrefs.HasKey("alexaUserDynamoKey"))
            {
                alexaUserDynamoKey = PlayerPrefs.GetString("alexaUserDynamoKey");
            }

            if (PlayerPrefs.HasKey("lastMessageTimestamp"))
            {
                lastMessageTimestamp = long.Parse(PlayerPrefs.GetString("lastMessageTimestamp"));
            }
            else
            {
                lastMessageTimestamp = 0;
            }
            pubnub.SusbcribeCallback += MessageListener;
            pubnub.Subscribe()
                .Channels(new List<string>(){
                    this.subChannel
                })
                .Execute();
            Debug.Log(displayName + "Started for scene on channel " + channel + "! Listening for messages...");
        }

        ///-------------------------------------------------------------------------------------------------
        /// <summary>   Gets the Skill's persistant session attributes from DynamoDB. </summary>
        ///
        /// <remarks>   Austin Wilson, 9/15/2018. </remarks>
        ///
        /// <param name="callback"> The callback. </param>
        ///-------------------------------------------------------------------------------------------------

        public void GetSessionAttributes(Action<GetSessionAttributesEventData> callback)
        {
            var key = new Dictionary<string, AttributeValue>
            {
                {"id", new AttributeValue {S = alexaUserDynamoKey}}
            };
            DynamoClient.GetItemAsync(tableName, key, (result) =>
            {
                if (result.Exception == null)
                {
                    if (debug)
                    {
                        Debug.Log(displayName + "GetSessionAttributes " + result.Response.HttpStatusCode);
                    }

                    if (result.Response.Item.Count > 0)
                    {
                        Dictionary<string, AttributeValue> values = result.Response.Item["attributes"].M;
                        RaiseGetSessionAttributesResponse(false, values, callback);
                    }
                    else
                    {
                        if (debug)
                        {
                            Debug.Log(displayName + "GetSessionAttributes did not find a user! Are you sure provided the correct table name?");
                        }
                        RaiseGetSessionAttributesResponse(true, null, callback, new Exception("GetSessionAttributes did not find a user! Are you sure provided the correct table name?"));
                    }
                }
                else
                {
                    if (debug)
                    {
                        Debug.LogError(displayName + "GetSessionAttributes: " + result.Exception.Message);
                    }
                    RaiseGetSessionAttributesResponse(true, null, callback, result.Exception);
                }
            });
        }

        ///-------------------------------------------------------------------------------------------------
        /// <summary>   Sets the Skill's persistant session attributes in DynamoDB. </summary>
        ///
        /// <remarks>   Austin Wilson, 9/15/2018. </remarks>
        ///
        /// <param name="attributes">   The attributes to set. </param>
        /// <param name="callback">     The callback. </param>
        ///-------------------------------------------------------------------------------------------------

        public void SetSessionAttributes(Dictionary<string, AttributeValue> attributes, Action<SetSessionAttributesEventData> callback)
        {
            var playerItem = new Dictionary<string, AttributeValue>
            {
                {"id", new AttributeValue {S = alexaUserDynamoKey}},
                {"attributes", new AttributeValue {M = attributes}}
            };
            DynamoClient.PutItemAsync(tableName, playerItem, (result) =>
            {
                if (result.Exception == null)
                {
                    if (debug)
                    {
                        Debug.Log(displayName + "SetSessionAttributes " + result.Response.HttpStatusCode);
                    }
                    RaiseSetSessionAttributesResponseHandler(false, callback);
                }
                else
                {
                    if (debug)
                    {
                        Debug.LogError(displayName + "SetSessionAttributes: " + result.Exception.Message);
                    }
                    RaiseSetSessionAttributesResponseHandler(true, callback, result.Exception);
                }
            });
        }

        ///-------------------------------------------------------------------------------------------------
        /// <summary>   Sends a message to Alexa Skill. NOTE: Skill will only recieve the message if it is listening for a response. </summary>
        ///
        /// <remarks>   Austin Wilson, 9/15/2018. </remarks>
        ///
        /// <param name="message">  The message. </param>
        /// <param name="callback"> The callback. </param>
        ///-------------------------------------------------------------------------------------------------

        public void SendToAlexaSkill(object message, Action<MessageSentEventData> callback)
        {
            pubnub.Publish()
                .Channel(pubChannel)
                .Message(message)
                .Async((result, status) => {
                    if (!status.Error)
                    {
                        if (debug)
                        {
                            Debug.Log(displayName + "SendToAlexa: " + "Message sent!");
                        }
                        RaiseMessageSent(false, message, callback);
                    }
                    else
                    {
                        if (debug)
                        {
                            Debug.LogError(displayName + "SendToAlexa: " + status.ErrorData.Ex);
                        }
                        RaiseMessageSent(true, null, callback, status.ErrorData.Ex);
                    }
                });
        }
        #endregion

        #region Private Methods
        private void MessageListener(object sender, EventArgs e)
        {
            SusbcribeEventEventArgs mea = e as SusbcribeEventEventArgs;

            if (mea.Status != null)
            {
                if (debug)
                {
                    PubnubStatusCategoryLogger(mea.Status.Category);
                }

                if (mea.Status.Error)
                {
                    if (debug)
                    {
                        Debug.LogError(displayName + mea.Status.ErrorData.Info);
                    }
                    RaiseHandleMessage(true, null, handleMessageCallback, mea.Status.ErrorData.Ex);
                }
            }
            if (mea.MessageResult != null)
            {
                Dictionary<string, object> msg = mea.MessageResult.Payload as Dictionary<string, object>;

                if (debug)
                {
                    Debug.Log(displayName + "New message!");
                }

                lastMessageTimestamp = mea.MessageResult.Timetoken + 1;
                RaiseHandleMessage(false, msg, handleMessageCallback);
            }
        }
        
        private void RaiseHandleMessage(bool isError, Dictionary<string, object> message, Action<HandleMessageEventData> callback, Exception exception = null)
        {
            handleMessageEventData = new HandleMessageEventData(EventSystem.current);
            handleMessageEventData.Initialize(isError, message, exception);

            callback(handleMessageEventData);
        }

        private void RaiseMessageSent(bool isError, object message, Action<MessageSentEventData> callback, Exception exception = null)
        {
            messageSentEventData = new MessageSentEventData(EventSystem.current);
            messageSentEventData.Initialize(isError, message, exception);

            callback(messageSentEventData);
        }

        private void RaiseErrorHandler(Exception exception, Action<ErrorEventData> callback)
        {
            errorEventData = new ErrorEventData(EventSystem.current);
            errorEventData.Initialize(exception);

            callback(errorEventData);
        }

        private void RaiseGetSessionAttributesResponse(bool isError, Dictionary<string, AttributeValue> values, Action<GetSessionAttributesEventData> callback, Exception exception = null)
        {
            
            getSessionAttributesEventData = new GetSessionAttributesEventData(EventSystem.current);
            getSessionAttributesEventData.Initialize(isError, values, exception);

            callback(getSessionAttributesEventData);
        }

        private void RaiseSetSessionAttributesResponseHandler(bool isError, Action<SetSessionAttributesEventData> callback, Exception exception = null)
        {
            setSessionAttributesEventData = new SetSessionAttributesEventData(EventSystem.current);
            setSessionAttributesEventData.Initialize(isError, exception);

            callback(setSessionAttributesEventData);
        }

        private void RaiseConnectionStatusResponse(bool isError, PNStatusCategory category, Action<ConnectionStatusEventData> callback, Exception exception = null)
        {
            Debug.Log(displayName + "1");
            connectionStatusEventData = new ConnectionStatusEventData(EventSystem.current);
            Debug.Log(displayName + "2");
            connectionStatusEventData.Initialize(isError, category, exception);
            Debug.Log(displayName + "3");

            //callback(connectionStatusEventData);
        }

        private void PubnubStatusCategoryLogger(PNStatusCategory category)
        {
            bool isError = false;
            switch (category)
            {
                case PNStatusCategory.PNNetworkIssuesCategory:
                    break;
                case PNStatusCategory.PNReconnectedCategory:
                    break;
                case PNStatusCategory.PNConnectedCategory:
                    PubnubCatchUp();
                    break;
                case PNStatusCategory.PNAccessDeniedCategory:
                    break;
                case PNStatusCategory.PNAcknowledgmentCategory:
                    break;
                case PNStatusCategory.PNTimeoutCategory:
                    break;
                case PNStatusCategory.PNDisconnectedCategory:
                    break;
                case PNStatusCategory.PNUnexpectedDisconnectCategory:
                    break;
                case PNStatusCategory.PNBadRequestCategory:
                    break;
                case PNStatusCategory.PNMalformedFilterExpressionCategory:
                    break;
                case PNStatusCategory.PNMalformedResponseCategory:
                    break;
                case PNStatusCategory.PNDecryptionErrorCategory:
                    break;
                case PNStatusCategory.PNTLSConnectionFailedCategory:
                    break;
                case PNStatusCategory.PNRequestMessageCountExceededCategory:
                    break;
            }

            RaiseConnectionStatusResponse(isError, category, handleConnectionStatusCallback);
        }

        private void PubnubCatchUp()
        {
            pubnub.History()
                .Channel(subChannel)
                .Count(100)
                .End(lastMessageTimestamp)
                .IncludeTimetoken(true)
                .Async((result, status) => {
                    if (status.Error)
                    {
                        if (debug)
                        {
                            Debug.LogError(displayName + status.ErrorData.Info);
                        }
                        RaiseHandleMessage(true, null, handleMessageCallback, status.ErrorData.Ex);
                    }
                    else
                    {
                        foreach (PNHistoryItemResult histItem in result.Messages)
                        {
                            Dictionary<string, object> msg = histItem.Entry as Dictionary<string, object>;

                            if (debug)
                            {
                                Debug.Log(displayName + "New message from history");
                            }
                            lastMessageTimestamp = histItem.Timetoken + 1;
                            RaiseHandleMessage(false, msg, handleMessageCallback);
                        }
                    }
                });
        }
        #endregion
    }
}