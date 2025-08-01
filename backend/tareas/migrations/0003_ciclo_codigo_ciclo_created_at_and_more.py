# Generated by Django 5.0.6 on 2025-07-22 22:08

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tareas', '0002_archivo_asignatura_ciclo_paralelo_grupotrabajo_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='ciclo',
            name='codigo',
            field=models.CharField(default='TMP', max_length=30, unique=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ciclo',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ciclo',
            name='estudiantes_totales',
            field=models.PositiveIntegerField(blank=True, default=None, null=True),
        ),
        migrations.AddField(
            model_name='ciclo',
            name='numero',
            field=models.PositiveSmallIntegerField(default=2),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ciclo',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
