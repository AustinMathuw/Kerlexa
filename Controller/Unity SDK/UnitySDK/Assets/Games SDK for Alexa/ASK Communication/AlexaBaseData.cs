using Amazon.DynamoDBv2.Model;
using PubNubAPI;
using System;
using System.Collections.Generic;
using UnityEngine.EventSystems;

namespace AmazonsAlexa.Unity.AlexaCommunicationModule
{
    public abstract class AlexaBaseData : BaseEventData
    {
        public bool IsError { get; private set; }
        public Exception Exception { get; private set; }

        public AlexaBaseData(EventSystem eventSystem) : base(eventSystem)
        {
        }

        protected virtual void BaseInitialize(bool isError, Exception exception)
        {
            Reset();
            IsError = isError;
            Exception = exception;
        }
    }

    public class ErrorEventData : AlexaBaseData
    {
        public ErrorEventData(EventSystem eventSystem) : base(eventSystem)
        {
        }

        public void Initialize(Exception exception, bool isError = true)
        {
            BaseInitialize(isError, exception);
        }
    }

    public class HandleMessageEventData : AlexaBaseData
    {
        public Dictionary<string, object> Message { get; private set; }

        public HandleMessageEventData(EventSystem eventSystem) : base(eventSystem)
        {
        }

        public void Initialize(bool isError, Dictionary<string, object> message, Exception exception = null)
        {
            BaseInitialize(isError, exception);
            Message = message;
        }
    }

    public class MessageSentEventData : AlexaBaseData
    {
        public object Message { get; private set; }

        public MessageSentEventData(EventSystem eventSystem) : base(eventSystem)
        {
        }

        public void Initialize(bool isError, object message, Exception exception = null)
        {
            BaseInitialize(isError, exception);
            Message = message;
        }
    }

    public class GetSessionAttributesEventData : AlexaBaseData
    {
        public Dictionary<string, AttributeValue> Values { get; private set; }

        public GetSessionAttributesEventData(EventSystem eventSystem) : base(eventSystem)
        {
        }

        public void Initialize(bool isError, Dictionary<string, AttributeValue> values, Exception exception = null)
        {
            BaseInitialize(isError, exception);
            Values = values;
        }
    }

    public class SetSessionAttributesEventData : AlexaBaseData
    {
        public SetSessionAttributesEventData(EventSystem eventSystem) : base(eventSystem)
        {
        }

        public void Initialize(bool isError, Exception exception = null)
        {
            BaseInitialize(isError, exception);
        }
    }

    public class ConnectionStatusEventData : AlexaBaseData
    {
        public PNStatusCategory Category { get; private set; }

        public ConnectionStatusEventData(EventSystem eventSystem) : base(eventSystem)
        {
        }

        public void Initialize(bool isError, PNStatusCategory category, Exception exception = null)
        {
            BaseInitialize(isError, exception);
            Category = category;
        }
    }
}