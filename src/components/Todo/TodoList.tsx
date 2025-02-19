import { Flex, List, Divider, TimePicker } from 'antd';
import ToDoListHeader from './ToDoListHeader';
import { ListProps } from '../../types/listData';
import TodoListItem from './TodoListItem';
import { useState } from 'react';
import ListItemInput from './commons/ListItemInput';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import addTodoListItem from '../api/addTodoListItem';
import dayjs from 'dayjs';
import { useDateStore } from '../../stores/dateStore';

function TodoList({ listData }: ListProps) {
  const [isClickAdd, setIsClickAdd] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const selectedDate = useDateStore((state) => state.selectedDate);

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: ({
      id,
      date,
      content,
      time,
    }: {
      id: string;
      date: string;
      content: string;
      time?: string;
    }) => addTodoListItem(id, date, content, time),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const handleClickConfirm = (content: string) => {
    setIsClickAdd(false);
    const mutateObj =
      listData.type === 'todo'
        ? { id: listData.id, date: selectedDate, content: content }
        : {
            id: listData.id,
            date: selectedDate,
            content: content,
            time: selectedTime,
          };
    mutate(mutateObj);
  };
  const handleClickCancel = () => {
    setIsClickAdd(false);
  };

  const handleClickAddButton = () => setIsClickAdd(true);

  return (
    <Flex vertical={true} gap="middle">
      <ToDoListHeader
        handleClick={handleClickAddButton}
        title={listData.title}
        id={listData.id}
        isRequired={listData.required}
      />
      {isClickAdd &&
        (listData.type === 'todo' ? (
          <ListItemInput
            handleClickConfirm={handleClickConfirm}
            handleClickCancel={handleClickCancel}
          />
        ) : (
          <>
            <TimePicker
              format="HH:mm"
              onChange={(date) => setSelectedTime(dayjs(date).format('HH:mm'))}
            />
            <ListItemInput
              handleClickConfirm={handleClickConfirm}
              handleClickCancel={handleClickCancel}
            />
          </>
        ))}
      <List
        itemLayout="horizontal"
        dataSource={listData.contents}
        renderItem={(item) => {
          return (
            <TodoListItem
              key={item.id}
              id={item.id}
              listId={listData.id}
              type={listData.type}
              content={item.content}
              done={item.done}
              time={item.time}
            />
          );
        }}
      ></List>
      <Divider />
    </Flex>
  );
}

export default TodoList;
