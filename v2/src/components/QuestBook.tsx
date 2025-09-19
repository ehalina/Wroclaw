import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { quests, Quest, QuestTask } from '@/data/quests';
import { useAudio } from '@/hooks/useAudio';

interface QuestBookProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationId?: string;
}

export const QuestBook: React.FC<QuestBookProps> = ({
  isOpen,
  onClose,
  currentLocationId
}) => {
  const [currentQuest, setCurrentQuest] = useState<Quest>(quests[0]);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  
  const questAudio = useAudio('/audio/quest.mp3', { loop: true, volume: 0.7 });
  const bookSound = useAudio('/audio/opening-a-book.wav', { volume: 0.8 });
  
  const questRef = useRef<HTMLDivElement>(null);

  // Загружаем сохраненные данные квеста
  useEffect(() => {
    const saved = localStorage.getItem('questProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCompletedTasks(new Set(data.completedTasks || []));
        setFlippedCards(new Set(data.flippedCards || []));
      } catch (error) {
        console.error('Ошибка загрузки прогресса квеста:', error);
      }
    }
  }, []);

  // Сохраняем прогресс
  const saveProgress = (completed: Set<number>, flipped: Set<number>) => {
    const data = {
      completedTasks: Array.from(completed),
      flippedCards: Array.from(flipped)
    };
    localStorage.setItem('questProgress', JSON.stringify(data));
  };

  // Открытие квеста
  useEffect(() => {
    if (isOpen) {
      console.log('📖 Открываем квест:', currentQuest.title);
      console.log('📖 Задания квеста:', currentQuest.tasks.map(t => ({ id: t.id, title: t.title, image: t.image })));
      
      bookSound.play();
      questAudio.play();
      
      // Прокручиваем к текущей локации, если она есть
      if (currentLocationId) {
        const task = currentQuest.tasks.find(t => t.locationId === currentLocationId);
        if (task) {
          setTimeout(() => {
            const taskElement = document.getElementById(`quest-task-${task.id}`);
            if (taskElement) {
              taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      }
    } else {
      questAudio.pause();
    }
  }, [isOpen, currentLocationId, questAudio, bookSound, currentQuest]);

  // Закрытие квеста
  const handleClose = () => {
    questAudio.pause();
    onClose();
  };

  // Переключение звука
  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (isSoundEnabled) {
      questAudio.pause();
    } else {
      questAudio.play();
    }
  };

  // Переворот карточки
  const toggleCard = (taskId: number) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(taskId)) {
      newFlipped.delete(taskId);
    } else {
      newFlipped.add(taskId);
    }
    setFlippedCards(newFlipped);
    saveProgress(completedTasks, newFlipped);
  };

  // Очистка прогресса
  const clearProgress = () => {
    if (confirm('Вы точно хотите очистить результаты квеста?')) {
      setCompletedTasks(new Set());
      setFlippedCards(new Set());
      localStorage.removeItem('questProgress');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] mx-4">
        {/* Контейнер книги */}
        <div 
          ref={questRef}
          className="relative w-full h-full glass rounded-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${currentQuest.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Контент квеста */}
          <div className="absolute inset-0 p-8 overflow-y-auto custom-scrollbar">
            {/* Заголовок */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 heading-medieval">
                {currentQuest.title}
              </h1>
              <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
                {currentQuest.intro}
              </p>
            </div>

            {/* Список заданий */}
            <div className="space-y-6">
              {currentQuest.tasks.map((task) => (
                <div
                  key={task.id}
                  id={`quest-task-${task.id}`}
                  className="glass rounded-xl p-6 hover-lift"
                >
                  <div className="flex items-start gap-4">
                    {/* Чекбокс */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded border-2 border-primary flex items-center justify-center">
                        {completedTasks.has(task.id) && (
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Контент задания */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xl font-semibold text-white">
                          {task.title}
                        </h3>
                        <div className="flex gap-2">
                          {/* Кнопка звука */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSound}
                            className="p-2 h-8 w-8"
                          >
                            {isSoundEnabled ? (
                              <Volume2 className="h-4 w-4" />
                            ) : (
                              <VolumeX className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {/* Кнопка переворота */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCard(task.id)}
                            className="p-2 h-8 w-8"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-white/70 mb-4">{task.description}</p>

                      {/* Карточка с изображением */}
                      <div className="relative max-w-md mx-auto">
                        <div 
                          className="relative w-full aspect-[4/3] cursor-pointer transition-transform duration-700"
                          style={{ transformStyle: 'preserve-3d' }}
                          onClick={() => toggleCard(task.id)}
                        >
                          {/* Лицевая сторона */}
                          <div 
                            className="absolute inset-0 w-full h-full backface-hidden"
                            style={{ 
                              transform: flippedCards.has(task.id) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                            }}
                          >
                            <img
                              src={task.image}
                              alt={task.title}
                              className="w-full h-full object-contain rounded-lg shadow-lg bg-white p-2"
                              onLoad={() => {
                                console.log('✅ Изображение загружено:', task.image);
                              }}
                              onError={(e) => {
                                console.error('❌ Ошибка загрузки изображения:', task.image);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            {task.expectationText && (
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-yellow-200 text-lg font-serif">
                                {task.expectationText}
                              </div>
                            )}
                          </div>

                          {/* Обратная сторона */}
                          <div 
                            className="absolute inset-0 w-full h-full backface-hidden"
                            style={{ 
                              transform: flippedCards.has(task.id) ? 'rotateY(0deg)' : 'rotateY(-180deg)'
                            }}
                          >
                            <img
                              src={task.backImage}
                              alt={`${task.title} - оборот`}
                              className="w-full h-full object-contain rounded-lg shadow-lg bg-white p-2"
                              onError={(e) => {
                                console.error('Ошибка загрузки изображения оборота:', task.backImage);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              <div className="bg-black/50 rounded-lg p-4 text-center">
                                <p className="text-white text-sm leading-relaxed">
                                  {task.backText}
                                </p>
                                {task.realityText && (
                                  <div className="mt-2 text-yellow-200 text-lg font-serif">
                                    {task.realityText}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={clearProgress}
              className="glass border-0 hover:bg-primary/20"
              title="Очистить прогресс"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleClose}
              className="glass border-0 hover:bg-primary/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
