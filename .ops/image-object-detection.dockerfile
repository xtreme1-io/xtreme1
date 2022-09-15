FROM python:3.10

WORKDIR /app

ADD ./requirements.txt .
RUN pip install -r requirements.txt

ADD . .

EXPOSE 5000

CMD flask run --host=0.0.0.0
