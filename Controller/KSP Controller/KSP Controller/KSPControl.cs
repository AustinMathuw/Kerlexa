using Amazon;
using Amazon.DynamoDBv2.Model;
using AmazonsAlexa.Unity.AlexaCommunicationModule;
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using WindowsInput;

namespace KSP_Controller
{
    public class KSPControl : PartModule
    {
        public string publishKey = "pub-xxx";
        public string subscribeKey = "sub-xxx";
        public string channel = "default";
        public string tableName = "KSPController";
        public string identityPoolId = "us-east-1:xxx";
        public string AWSRegion = RegionEndpoint.USEast1.SystemName;
        public bool debug = true;

        public float yawTime = 0.0F;
        public float pitchTime = 0.0F;
        public float rollTime = 0.0F;

        public float yawVal = 0.0F;
        public float pitchVal = 0.0F;
        public float rollVal = 0.0F;

        public float burnTime = 0.0F;
        public float currentThrottle = 0.0F;

        public string displayName = "Kerlexa";

        private Dictionary<string, AttributeValue> attributes;
        private AmazonAlexaManager alexaManager;

        public override void OnStart(StartState state)
        {

            if(state != StartState.Editor)
            {
                //PlayerPrefs.DeleteKey("alexaUserDynamoKey");
                UnityInitializer.AttachToGameObject(this.gameObject);
                AWSConfigs.HttpClient = AWSConfigs.HttpClientOption.UnityWebRequest;
                alexaManager = new AmazonAlexaManager(publishKey, subscribeKey, channel, tableName, identityPoolId, AWSRegion, this.gameObject, OnAlexaMessage, null, debug); //Initialize the Alexa Manager
            }
        }

        public void ConfirmSetup(GetSessionAttributesEventData eventData)
        {
            //Step 7: Notify the skill that setup has completed by updating the skills persistant attributes (in DynamoDB)
            attributes = eventData.Values;
            attributes["SETUP_STATE"] = new AttributeValue { S = "COMPLETED" }; //Set SETUP_STATE attribute to a string, COMPLETED
            alexaManager.SetSessionAttributes(attributes, SetAttributesCallback);
        }

        //Callback for when a message is recieved
        public void OnAlexaMessage(HandleMessageEventData eventData)
        {
            //Step 10: Listen for new messages from the Alexa skill
            Debug.Log(displayName + " OnAlexaMessage: " + eventData.Message["type"]);// + " " + eventData.Message["message"]);

            Dictionary<string, object> message = eventData.Message;

            //Get Session Attributes with in-line defined callback
            switch (message["type"] as string)
            {
                case "AlexaUserId":
                    Debug.Log(displayName + " AlexaUserId: " + message["message"]);
                    alexaManager.alexaUserDynamoKey = message["message"] as string;
                    break;
            }

            alexaManager.GetSessionAttributes((result) =>
            {
                if (result.IsError)
                    Debug.LogError(eventData.Exception.Message);

                switch (message["type"] as string)
                {
                    case "AlexaUserId":
                        ConfirmSetup(result);
                        break;
                    case "ExecuteCommand":
                        Debug.Log(displayName + " Requested Execute Command: " + message["message"]);
                        ExecuteCommand(message["type"] as string, message["message"] as string, Convert.ToSingle(message["time"]), Convert.ToSingle(message["value"]), result);
                        break;
                    case "GetAttribute":
                        Debug.Log(displayName + " Requested Attribute: " + message["message"]);
                        GetAttribute(message["type"] as string, message["message"] as string, result);
                        break;
                    case "Stage":
                        Debug.Log(displayName + " Requested Staging");
                        InputSimulator Ins = new InputSimulator();
                        Ins.Keyboard.KeyPress(WindowsInput.Native.VirtualKeyCode.SPACE);
                        break;
                    case "SetThrottle":
                        Debug.Log(displayName + " Requested SetThrottle: " + message["message"]);
                        currentThrottle = Convert.ToSingle(message["message"]);
                        Debug.Log(displayName + currentThrottle);
                        vessel.OnFlyByWire += new FlightInputCallback(SetThrottle);
                        break;
                    case "BurnCommand":
                        Debug.Log(displayName + " Requested BurnCommand: " + message["message"] + ", " + message["time"]);
                        burnTime = Convert.ToSingle(message["time"]);
                        currentThrottle = Convert.ToSingle(message["message"]);
                        vessel.OnFlyByWire += new FlightInputCallback(Burn);
                        break;
                    default:
                        break;
                }
            });
        }

        public void ExecuteCommand(string type, string message, float time, float value, GetSessionAttributesEventData eventData)
        {
            Vessel vessel = this.vessel;
            FlightCtrlState flightCtrl = new FlightCtrlState();
            switch (message)
            {
                case "roll":
                    rollTime = time;
                    rollVal = value;
                    vessel.OnFlyByWire += new FlightInputCallback(Roll);
                    break;
                case "pitch":
                    pitchTime = time;
                    pitchVal = value;
                    vessel.OnFlyByWire += new FlightInputCallback(Pitch);
                    break;
                case "yaw":
                    yawTime = time;
                    yawVal = value;
                    vessel.OnFlyByWire += new FlightInputCallback(Yaw);
                    break;
            }
        }

        void Roll(FlightCtrlState flightCtrl)
        {
            Debug.Log(displayName + " In Roll");
            rollTime -= Time.deltaTime;
            if (rollTime < 0)
            {
                rollVal = 0;
                vessel.OnFlyByWire -= new FlightInputCallback(Roll);
            }
            flightCtrl.roll = rollVal;
        }

        void Pitch(FlightCtrlState flightCtrl)
        {
            Debug.Log(displayName + " In Pitch");
            pitchTime -= Time.deltaTime;
            if (pitchTime < 0)
            {
                pitchVal = 0.0F;
                vessel.OnFlyByWire -= new FlightInputCallback(Pitch);
            }
            flightCtrl.pitch = pitchVal;
        }

        void Yaw(FlightCtrlState flightCtrl)
        {
            Debug.Log(displayName + " In Yaw");
            yawTime -= Time.deltaTime;
            if (yawTime < 0)
            {
                yawVal = 0.0F;
                vessel.OnFlyByWire -= new FlightInputCallback(Yaw);
            }
            flightCtrl.yaw = yawVal;
        }

        void Burn(FlightCtrlState flightCtrl)
        {
            vessel.OnFlyByWire -= new FlightInputCallback(SetThrottle);
            Debug.Log(displayName + " In Burn");
            burnTime -= Time.deltaTime;
            if (burnTime < 0)
            {
                vessel.OnFlyByWire -= new FlightInputCallback(Yaw);
            }
            flightCtrl.mainThrottle = currentThrottle;
        }

        void SetThrottle(FlightCtrlState flightCtrl)
        {
            Debug.Log(displayName + " In SetThrottle");
            flightCtrl.mainThrottle = currentThrottle;
            //vessel.OnFlyByWire -= new FlightInputCallback(SetThrottle);
        }

        public void GetAttribute(string type, string message, GetSessionAttributesEventData eventData)
        {
            Dictionary<string, string> messageToAlexa = new Dictionary<string, string>();

            Vessel vessel = this.vessel;
            switch (message)
            {
                case "mass":
                    messageToAlexa.Add("object", vessel.RevealMass().ToString());
                    break;
                case "altitude":
                    messageToAlexa.Add("object", vessel.RevealAltitude().ToString());
                    break;
                case "body":
                    messageToAlexa.Add("object", vessel.mainBody.ToString());
                    break;
                case "velocity":
                    messageToAlexa.Add("object", vessel.RevealSpeed().ToString());
                    break;
                default:
                    messageToAlexa.Add("object", "nothing");
                    break;
            }
            alexaManager.SendToAlexaSkill(messageToAlexa, OnMessageSent);
        }

        private void OnMessageSent(MessageSentEventData eventData)
        {
            Debug.Log(displayName + " OnSetAttributes");
            if (eventData.IsError)
                Debug.LogError(eventData.Exception.Message);
        }

        public void SetAttributesCallback(SetSessionAttributesEventData eventData)
        {
            //Step 13: Callback for when session attributes have been updated
            Debug.Log(displayName + " OnSetAttributes");
            if (eventData.IsError)
                Debug.LogError(eventData.Exception.Message);
        }


        public void OnMessageDeleted(ErrorEventData eventData)
        {
            //Step 14: Callback for when a message is deleted
            Debug.Log(displayName + " OnMessageDeleted");
            if (eventData.IsError)
                Debug.LogError(eventData.Exception.Message);
        }
    }
}
