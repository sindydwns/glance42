.DEFAULT_GOAL = all

TARGET = app.zip
SRC = src/ \
		package.json

$(TARGET): $(SRC)
	zip -r $@ $^

all: $(TARGET)

fclean:
	rm -rf $(TARGET)

re:	fclean
	$(MAKE)

.PHONY: all fclean re
