import serial
import time
from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
from pubnub.enums import PNStatusCategory
 

from pubnub.callbacks import SubscribeCallback
from pubnub.enums import PNOperationType, PNStatusCategory
 
pnconfig = PNConfiguration()
pnconfig.subscribe_key = ""
pnconfig.publish_key = ""
pnconfig.ssl = False

ser = serial.Serial('COM4', 9600)
#Right around y-axis
def wheel_turn_side():
    return ser.write(b'2')

#Left around x-axis
def wheel_turn_vert():
    return ser.write(b'1')

#Left around y-axis
def wheel_turn_side_rev():
    return ser.write(b'5')

#Right around x-axis
def wheel_turn_vert_rev():
    return ser.write(b'6')


def enginelight():
    return ser.write(b'7')


def decouple():
    return ser.write(b'3')

 
class MySubscribeCallback(SubscribeCallback):
    def status(self, pubnub, status):
        pass
 
    def presence(self, pubnub, presence):
        pass  # handle incoming presence data
 
    def message(self, pubnub, message):
        message = message.message
        print(message)
        type1 = message["type"]
        if(type1 == "ExecuteCommand"):
            time = message["time"]
            command = message["message"]
            value = message["value"]
            if(command == "yaw"):
                if(value == 1):
                    wheel_turn_side_rev()
                else:
                    wheel_turn_side()
            elif(command == "roll"):
                if(value == 1):
                    wheel_turn_vert_rev()
                else:
                    wheel_turn_vert()
        elif(type1 == "BurnCommand"):
            time = message["time"]
            enginelight()
        elif(type1 == "SetThrottle"):
            throttle = message["message"]
            enginelight()
        elif(type1 == "Stage"):
            decouple()
        pass  # handle incoming messages
 

pubnub = PubNub(pnconfig)
pubnub.add_listener(MySubscribeCallback())
pubnub.subscribe().channels('defaultA').execute()













