

void setup()
{
    Serial.begin(9600);
}

void loop()
{
    String content = "";
    char c;

    while (Serial.available()) {
        c = Serial.read();
        content.concat(c);
        delay(10);
    }

    if (content != "") {
        Serial.println(content);
    }
}