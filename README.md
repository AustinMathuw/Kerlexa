# Kerlexa

## Inspiration

Stranded out there, amongst the stars, stands a lonely little green man, left with only his thoughts to explore the star system he calls home. When he was a child, he heard stories about brave individuals who sought to expand their civilization's reach in the name of science. But he would not just look up to these individuals, he would become one of them, all alone on the most desert-ish planet in his star system; Duna. But was he really alone? Or did Jebadiah Kerman have a friend the whole time? After all, the fine engineers on Kerbin were able to scavenge him an Artificial Intelligence they found just lying around, Amazon's Alexa.

Built with the performance of PubNub, the reliability of Amazon Web Services, and the fun of Kerbal Space Program, our team made Kerlexa. An Alexa integrated game and model, or in the future, even a concept for the development of Spaceflight and Orbital Data Analysis in space crafts.

## How does Kerlexa work?

### Part 1: The Mod

As college students, unfortunately we did not have the ability to drop hundred of millions of dollars on a Saturn V rocket, like our hero Elon Musk, to be able to test-drive our idea of bringing, not just Alexa, but voice technology to act as crew members and pilots on deep space missions all around our solar system.

To counter our shallow pockets and lack of manpower, we decided to take a look at one of the most widely known spaceflight simulators, Kerbal Space Program.

While not the most accurate simulator, Kerbal Space Program is known for it amazing orbital physics built on the Unity Engine, and makes up for it in cute little green Kerbals.

In the community of Kerbal Space Program players, there is a large interest in the making of mods that show off near future technologies. This interest has led to many inspiring that has only encouraged the documentation of the modding API for Kerbal Space Program. With this well documented API, and my Games SDK for Alexa I (Austin Wilson) developed last fall, we were able to build a mod that exposed Kerbal Space Program's vessel control systems to my Alexa Skill, simulating data flows for celestial data, speed, mass of ship, altitude, and many, many more data sources. Our mod also gives Alexa the ability control the different control schemes within the game, thus allowing Alexa to essentially be your co-pilot

### Part 2: The Physical Demo Device

Our rocket model, utilizing Arduino and an army of zip ties and hot glue, operates based on yaw and roll axises, that translate voice commands into delays within the code using math functions, to run the motors to reach specific angles and rotation times. In real space travel, instead of axial motor movements, spaceships utilize Reaction Control Systems (RCS), that would spurt puffs of air to steer the ship. In a weighted real world model, using motors, that demonstrated the possibility of voice control that utilizes math components, like an RCS would, made more sense physically in a gravity controlled environment. 

Gravity, more specifically weight became a problematic issue in the beginning stages of our model. Originally the large square piece of wood was our base and the ship rotated vertically. We saw that velocity was not constant and as weight shifted, velocity shifted. It became hard to form solid math that worked for all cases of time and degree. Frustrated we decided to look at our project in a new angle, literally a new angle, by flipping it over. We realized that this was what we were looking for, and realized that this model more closely fit in-space movement that doesn't rely heavily on a vertical axis. 

Hooked up to the Arduino are 3 LEDs that respond to Alexa commands. The two green ones light up during in flight staging, and the red one lights up during burn and throttle. They are to simulate button and engine control that could be done using voice control. 

The model, while simple and governed by the limitations of a grounded rocket, show that not only is a virtual integration of voice control with space-travel is possible, but so is real-life integration.

### Part 3: The Alexa Skill

Tying it all together (Literally!) The Alexa Skill aspect of Kerlexa acts as the intersection of all points in this project, as the main focus of Kerlexa is to integrate Alexa into the area of space exploration. Our Alexa skill is hosted on the AWS platform, specifically using the following services:

* AWS Lambda
* S3
* DynamoDB
* CloudWatch
* Cognito

Along with AWS services, the skill uses PubNub to communicate between all of the devices that take part in our simulation.

Currently, our skill supports the following actions:

* Set Throttle
* Pitch, Yaw, and Roll for x Seconds
* Burn for x Seconds with x Percent Throttle
* Rocket Staging
* Get the Velocity of the Vessel
* Get the Mass of the Vessel
* Get the Altitude of the Vessel
* Get the Celestial body the Vessel is orbiting.

## What we could've done with more time

We would have liked to add more features to the Alexa Skill. Specifically, we wanted to utilize Amazon's Alexa Gadget's API to add more visuals to our physical demo, such as waning flags or even timid actuators.

## Conclusion

Overall, our team really enjoyed building this project and we are really excited to bring voice assistants more voice in spaceflight.

## Special Thanks

Thank you to all of the sponsors, HackerSociety and Major League Hacking for being really helpful and supportive throughout the experience.
